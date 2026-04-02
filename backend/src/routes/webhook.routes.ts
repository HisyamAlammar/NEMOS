/**
 * routes/webhook.routes.ts — Xendit Webhook Handler
 *
 * POST /api/webhooks/xendit — Menerima notifikasi pembayaran dari Xendit
 *
 * ╔══════════════════════════════════════════════════════╗
 * ║  IDEMPOTENCY (Rule 2): Setiap webhook dicek dulu    ║
 * ║  via xenditId di database. Jika sudah diproses,     ║
 * ║  return 200 tanpa proses ulang.                     ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * Flow:
 * 1. Verifikasi webhook signature (x-callback-token)
 * 2. Idempotency check — sudah pernah diproses?
 * 3. Enqueue ke BullMQ untuk processing async
 * 4. Return 200 segera (Xendit expects fast response)
 */
import { Router, Request, Response } from "express";
import express from "express";
import { env } from "../config/env";
import { verifyWebhookSignature } from "../services/xendit.service";
import { enqueuePaymentJob } from "../services/queue.service";
import { prisma } from "../services/prisma.service";

export const webhookRouter = Router();

// Webhook memerlukan raw body untuk verifikasi signature
webhookRouter.use(express.raw({ type: "application/json" }));

// ── POST /api/webhooks/xendit ─────────────────────────────
webhookRouter.post("/xendit", async (req: Request, res: Response) => {
  try {
    // ── STEP 1: Parse Body ──────────────────────────────
    let payload: any;
    try {
      // Body bisa Buffer (dari express.raw) atau sudah di-parse
      const bodyStr = Buffer.isBuffer(req.body)
        ? req.body.toString("utf-8")
        : JSON.stringify(req.body);
      payload = JSON.parse(bodyStr);
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }

    // ── STEP 2: Verify Webhook Signature ────────────────
    const incomingToken = req.headers["x-callback-token"] as string || "";
    const isValid = verifyWebhookSignature(env.XENDIT_WEBHOOK_TOKEN, incomingToken);

    if (!isValid) {
      console.warn("[WEBHOOK] ❌ Invalid webhook signature");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    // ── STEP 3: Extract Payment Info ────────────────────
    const xenditInternalId = payload.id || payload.payment_id;
    const externalId = payload.external_id || payload.reference_id;
    const amount = payload.amount || payload.paid_amount;
    const status = payload.status;

    if (!xenditInternalId && !externalId) {
      console.warn("[WEBHOOK] Missing both xendit ID and external_id in payload");
      res.status(400).json({ error: "Missing payment ID" });
      return;
    }

    // BUG-H7 FIX: Structured entry log for demo debugging
    console.log(`[WEBHOOK] Received:`, {
      xenditId: xenditInternalId,
      externalId,
      status,
      amount,
      event: payload.event || 'N/A',
    });

    // ── STEP 4: IDEMPOTENCY CHECK (Rule 2) ──────────────
    // BUG-H7 FIX: Use externalId for lookup — that's what we store
    // in transaction.xenditId when creating investments/upgrades.
    // Fall back to xenditInternalId only if externalId is not available.
    const lookupId = externalId || xenditInternalId;

    const existingTx = await prisma.transaction.findUnique({
      where: { xenditId: lookupId },
    });

    if (existingTx && existingTx.status !== "PENDING") {
      // Sudah diproses sebelumnya — jangan proses ulang
      console.log(`[WEBHOOK] ⏭ Already processed:`, {
        lookupId,
        existingStatus: existingTx.status,
        txId: existingTx.id,
      });
      res.status(200).json({
        status: "already_processed",
        txId: existingTx.id,
      });
      return;
    }

    // ── STEP 5: Enqueue ke BullMQ ───────────────────────
    // Cepat return 200 ke Xendit, processing dilakukan async
    if (status === "COMPLETED" || status === "PAID" || status === "SUCCEEDED") {
      const jobId = await enqueuePaymentJob({
        xenditId: lookupId,
        externalId: externalId || "",
        amount: Number(amount),
        type: "INVESTMENT",
      });

      console.log(`[WEBHOOK] ✅ Job enqueued: ${jobId}`);
    } else {
      console.log(`[WEBHOOK] ℹ️ Non-success status: ${status} — no action taken`);
    }

    // Xendit expects 200 quickly, otherwise it will retry
    res.status(200).json({ status: "received" });

  } catch (error: any) {
    console.error("[WEBHOOK] Error:", error.message);
    // Still return 200 to prevent Xendit from retrying
    // We'll handle the error internally
    res.status(200).json({ status: "error_noted" });
  }
});
