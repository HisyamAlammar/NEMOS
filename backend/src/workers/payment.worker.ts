/**
 * workers/payment.worker.ts — BullMQ Payment Processor
 *
 * Consumer yang memproses payment jobs dari queue.
 * Ini adalah orchestrator antara Xendit callback dan Database (Rule 3).
 *
 * Flow:
 * 1. Terima job dari queue (deduplicated by xenditId)
 * 2. Idempotency check LAGI di database (belt-and-suspenders)
 * 3. Update Transaction status ke CONFIRMED
 * 4. Update Investment status ke ACTIVE
 * 5. Update UMKM current funding
 * 6. Create Tranche 1 (auto-release tanpa AI verification)
 */
import { Worker, Job } from "bullmq";
import { redisConnection } from "../services/queue.service";
import { prisma } from "../services/prisma.service";
import { Prisma } from "@prisma/client";

interface PaymentJobData {
  xenditId: string;
  externalId: string;
  amount: number;
  type: "INVESTMENT" | "REPAYMENT";
  rawPayload: Record<string, unknown>;
}

async function processPayment(job: Job<PaymentJobData>): Promise<void> {
  const { xenditId, externalId, amount, type, rawPayload } = job.data;

  console.log(`[WORKER] Processing payment: ${xenditId}`);

  // ── IDEMPOTENCY CHECK (Rule 2 — Belt & Suspenders) ────
  const existingTx = await prisma.transaction.findUnique({
    where: { xenditId },
  });

  if (existingTx && existingTx.status === "CONFIRMED") {
    console.log(`[WORKER] ⏭ Already confirmed: ${xenditId}`);
    return; // Job complete, no duplicate processing
  }

  // ── ATOMIC DATABASE TRANSACTION ───────────────────────
  // Semua operasi di bawah ini harus berhasil semua atau gagal semua
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Update or create Transaction record
    const transaction = await tx.transaction.upsert({
      where: { xenditId },
      create: {
        xenditId,
        type: type === "INVESTMENT" ? "INVESTMENT" : "REPAYMENT",
        amount: BigInt(amount),
        status: "CONFIRMED",
        rawPayload: JSON.parse(JSON.stringify(rawPayload)),
      },
      update: {
        status: "CONFIRMED",
        rawPayload: JSON.parse(JSON.stringify(rawPayload)),
      },
    });

    // 2. Find the linked Investment via externalId (= xenditTxId)
    const investment = await tx.investment.findUnique({
      where: { xenditTxId: externalId },
      include: { umkm: true },
    });

    if (!investment) {
      console.warn(`[WORKER] ⚠️ No investment found for externalId: ${externalId}`);
      return;
    }

    // Link transaction to investment if not already linked
    if (!transaction.investId) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { investId: investment.id },
      });
    }

    // 3. Update Investment status to ACTIVE
    await tx.investment.update({
      where: { id: investment.id },
      data: { status: "ACTIVE" },
    });

    // 4. Update UMKM current funding
    await tx.uMKM.update({
      where: { id: investment.umkmId },
      data: {
        current: {
          increment: BigInt(amount),
        },
      },
    });

    // 5. Create Tranche 1 — otomatis tanpa AI verification
    //    (Tranche 1 = pencairan awal setelah funding masuk)
    await tx.tranche.create({
      data: {
        investId: investment.id,
        stage: 1,
        amount: BigInt(Math.floor(amount * 0.6)), // 60% tranche pertama
        aiVerified: false, // Tranche 1 tidak perlu AI
        releasedAt: new Date(),
      },
    });

    console.log(`[WORKER] ✅ Payment processed successfully:`);
    console.log(`         TX: ${xenditId}`);
    console.log(`         Investment: ${investment.id}`);
    console.log(`         UMKM: ${investment.umkm.name}`);
    console.log(`         Amount: Rp ${amount.toLocaleString("id-ID")}`);
  });
}

// ── START WORKER ──────────────────────────────────────────
export function startPaymentWorker(): void {
  const worker = new Worker<PaymentJobData>(
    "nemos-payment",
    processPayment,
    {
      connection: redisConnection,
      concurrency: 5,     // Process 5 jobs at a time max
      limiter: {
        max: 10,
        duration: 1000,   // Max 10 per second
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`[WORKER] ✅ Job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[WORKER] ❌ Job failed: ${job?.id}`, error.message);
    // BullMQ will auto-retry based on defaultJobOptions.attempts
  });

  worker.on("error", (error) => {
    console.error("[WORKER] Worker error:", error.message);
  });

  console.log("[WORKER] Payment worker started, waiting for jobs...");
}
