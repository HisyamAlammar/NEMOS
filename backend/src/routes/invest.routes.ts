/**
 * routes/invest.routes.ts — Investment Endpoint
 *
 * POST /api/invest — Buat investasi baru (guarded by Investment Gate)
 *
 * Flow:
 * 1. authMiddleware → verify JWT
 * 2. investmentGateMiddleware → cek learningProgress >= 100
 * 3. Handler → validasi input → buat Investment record → buat Xendit QRIS
 */
import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { investmentGateMiddleware } from "../middleware/investmentGate";
import { prisma } from "../services/prisma.service";
import { createQrisPayment } from "../services/xendit.service";
import { AppError } from "../services/auth.service";

export const investRouter = Router();

// ── POST /api/invest ──────────────────────────────────────
investRouter.post(
  "/invest",
  authMiddleware,             // Step 1: verify JWT
  investmentGateMiddleware,   // Step 2: Investment Gate (Magic Moment 1)
  async (req: Request, res: Response) => {
    try {
      const { umkmId, amount } = req.body;
      const userId = req.user!.userId;

      // ── INPUT VALIDATION ──────────────────────────────
      if (!umkmId || !amount) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "umkmId dan amount wajib diisi",
        });
        return;
      }

      const amountNum = Number(amount);

      if (isNaN(amountNum) || amountNum < 100_000) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Minimum investasi Rp 100.000",
        });
        return;
      }

      // ── VERIFY UMKM EXISTS ────────────────────────────
      const umkm = await prisma.uMKM.findUnique({
        where: { id: umkmId },
      });

      if (!umkm) {
        res.status(404).json({
          error: "UMKM_NOT_FOUND",
          message: "UMKM tidak ditemukan",
        });
        return;
      }

      // ── CHECK FUNDING TARGET ──────────────────────────
      const remaining = Number(umkm.target - umkm.current);
      if (amountNum > remaining) {
        res.status(400).json({
          error: "EXCEEDS_TARGET",
          message: `Jumlah melebihi sisa target pendanaan. Sisa: Rp ${remaining.toLocaleString("id-ID")}`,
          data: {
            target: Number(umkm.target),
            current: Number(umkm.current),
            remaining,
          },
        });
        return;
      }

      // ── CHECK TIER ACCESS ─────────────────────────────
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true },
      });

      if (umkm.grade !== "C" && user?.tier === "FREE") {
        res.status(403).json({
          error: "TIER_RESTRICTED",
          message: "UMKM Grade A dan B hanya tersedia untuk pengguna Premium",
        });
        return;
      }

      // ── CREATE INVESTMENT RECORD ──────────────────────
      // Generate a unique xenditTxId for idempotency (Rule 2)
      const xenditExternalId = `nemos-inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const investment = await prisma.investment.create({
        data: {
          amount: BigInt(amountNum),
          userId,
          umkmId,
          xenditTxId: xenditExternalId,
          status: "PENDING",
        },
      });

      // ── CREATE XENDIT QRIS PAYMENT ────────────────────
      let paymentData;
      try {
        paymentData = await createQrisPayment({
          externalId: xenditExternalId,
          amount: amountNum,
          description: `Investasi NEMOS — ${umkm.name}`,
        });
      } catch (xenditError: any) {
        // Rollback investment jika Xendit gagal
        await prisma.investment.delete({ where: { id: investment.id } });

        console.error("[INVEST] Xendit QRIS creation failed:", xenditError.message);
        res.status(502).json({
          error: "PAYMENT_GATEWAY_ERROR",
          message: "Gagal membuat pembayaran. Silakan coba lagi.",
        });
        return;
      }

      // ── CREATE INITIAL TRANSACTION RECORD ─────────────
      await prisma.transaction.create({
        data: {
          xenditId: xenditExternalId,
          type: "INVESTMENT",
          amount: BigInt(amountNum),
          status: "PENDING",
          investId: investment.id,
        },
      });

      // ── RESPONSE ──────────────────────────────────────
      res.status(201).json({
        message: "Investasi berhasil dibuat. Silakan lakukan pembayaran.",
        data: {
          investmentId: investment.id,
          payment: {
            qrString: paymentData.qrString,
            amount: paymentData.amount,
            expiresAt: paymentData.expiresAt,
          },
          umkm: {
            id: umkm.id,
            name: umkm.name,
          },
        },
      });

    } catch (error: any) {
      console.error("[INVEST] Error:", error.message);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Gagal memproses investasi",
      });
    }
  }
);
