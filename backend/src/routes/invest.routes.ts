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

      // ── [PERF-P1-03] ATOMIC INVESTMENT FLOW ─────────────
      // All DB writes + Xendit call wrapped in transaction
      // to prevent orphaned records on partial failure.
      const xenditExternalId = `nemos-inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      let investment: any;
      let paymentData: any;

      try {
        // Step 1: Create Investment + Transaction atomically
        const dbResult = await prisma.$transaction(async (tx: any) => {
          const inv = await tx.investment.create({
            data: {
              amount: BigInt(amountNum),
              userId,
              umkmId,
              xenditTxId: xenditExternalId,
              status: "PENDING",
            },
          });

          await tx.transaction.create({
            data: {
              xenditId: xenditExternalId,
              type: "INVESTMENT",
              amount: BigInt(amountNum),
              status: "PENDING",
              investId: inv.id,
            },
          });

          return inv;
        });

        investment = dbResult;

        // Step 2: Create Xendit QRIS (outside DB transaction — external HTTP)
        paymentData = await createQrisPayment({
          externalId: xenditExternalId,
          amount: amountNum,
          description: `Investasi NEMOS — ${umkm.name}`,
        });
      } catch (error: any) {
        // If Xendit fails but DB succeeded, rollback DB records
        if (investment) {
          await prisma.transaction.deleteMany({ where: { xenditId: xenditExternalId } }).catch(() => {});
          await prisma.investment.delete({ where: { id: investment.id } }).catch(() => {});
        }
        console.error("[INVEST] Investment flow failed:", error.message);
        res.status(502).json({
          error: "PAYMENT_GATEWAY_ERROR",
          message: "Gagal membuat pembayaran. Silakan coba lagi.",
        });
        return;
      }

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

// ── GET /api/invest/:investmentId/status ──────────────────
// BUG-H8: Real-time payment status polling endpoint.
// PaymentModal polls this every 3s to detect payment confirmation.
investRouter.get(
  "/invest/:investmentId/status",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const investmentId = req.params.investmentId as string;
      const userId = req.user!.userId;

      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          userId: true,
        },
      });

      if (!investment) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "Investasi tidak ditemukan",
        });
        return;
      }

      // Security: only the owner can check their investment status
      if (investment.userId !== userId) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Anda tidak memiliki akses ke investasi ini",
        });
        return;
      }

      res.json({
        investmentId: investment.id,
        status: investment.status,
        amount: Number(investment.amount),
        paidAt: investment.status === "ACTIVE" ? investment.createdAt : null,
      });
    } catch (error: any) {
      console.error("[INVEST] Status check error:", error.message);
      res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "Gagal mengecek status investasi",
      });
    }
  }
);
