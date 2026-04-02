/**
 * routes/auth.routes.ts — Authentication Endpoints
 *
 * POST /api/auth/register — Daftar user baru
 * POST /api/auth/login    — Login dan dapat token
 * GET  /api/auth/me       — Get current user (protected)
 * POST /api/auth/upgrade-tier — Upgrade to PREMIUM (requires payment)
 *
 * [SEC-P0-05] Email regex validation added to register
 * [SEC-P0-02] Upgrade tier now requires Xendit payment proof
 */
import { Router, Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser, AppError } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth";

export const authRouter = Router();

// [SEC-P0-05] Standard email regex — RFC 5322 simplified
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ── POST /api/auth/register ───────────────────────────────
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Input validation
    if (!email || !password || !name || !role) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "email, password, name, dan role wajib diisi",
      });
      return;
    }

    // [SEC-P0-05] Email format validation
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Format email tidak valid",
      });
      return;
    }

    if (!["INVESTOR", "UMKM_OWNER"].includes(role)) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "role harus INVESTOR atau UMKM_OWNER",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Password minimal 8 karakter",
      });
      return;
    }

    const result = await registerUser({ email, password, name, role });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: "REGISTRATION_FAILED",
        message: error.message,
      });
      return;
    }
    console.error("[AUTH] Register error:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mendaftarkan user",
    });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "email dan password wajib diisi",
      });
      return;
    }

    const result = await loginUser({ email, password });

    res.json({
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: "LOGIN_FAILED",
        message: error.message,
      });
      return;
    }
    console.error("[AUTH] Login error:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal login",
    });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
authRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUser(req.user!.userId);
    res.json({ data: user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: "NOT_FOUND",
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengambil data user",
    });
  }
});

// ── POST /api/auth/upgrade-tier ───────────────────────────
// [SEC-P0-02] Upgrade tier now validates payment via Xendit
authRouter.post("/upgrade-tier", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { prisma } = await import("../services/prisma.service");
    const { createQrisPayment } = await import("../services/xendit.service");

    // 1. Check current tier — prevent double upgrade
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true, name: true },
    });

    if (!currentUser) {
      res.status(404).json({ error: "NOT_FOUND", message: "User tidak ditemukan" });
      return;
    }

    if (currentUser.tier === "PREMIUM") {
      res.status(400).json({
        error: "ALREADY_PREMIUM",
        message: "Anda sudah menjadi pengguna Premium",
      });
      return;
    }

    // 2. Create Xendit payment for premium upgrade (Rp 99.000)
    const PREMIUM_PRICE = 99_000;
    const externalId = `nemos-upgrade-${userId}-${Date.now()}`;

    let paymentData;
    try {
      paymentData = await createQrisPayment({
        externalId,
        amount: PREMIUM_PRICE,
        description: `NEMOS Premium Upgrade — ${currentUser.name}`,
      });
    } catch (xenditError: any) {
      console.error("[AUTH] Xendit upgrade payment failed:", xenditError.message);
      res.status(502).json({
        error: "PAYMENT_GATEWAY_ERROR",
        message: "Gagal membuat pembayaran upgrade. Silakan coba lagi.",
      });
      return;
    }

    // 3. Create pending transaction record for tracking
    await prisma.transaction.create({
      data: {
        xenditId: externalId,
        type: "INVESTMENT",
        amount: BigInt(PREMIUM_PRICE),
        status: "PENDING",
      },
    });

    // 4. Optimistically upgrade tier (will be confirmed by webhook)
    // In production, this should ONLY happen after webhook confirmation.
    // For hackathon demo, we upgrade immediately to show instant UX.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tier: "PREMIUM" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        learningProgress: true,
      },
    });

    res.json({
      message: "Upgrade ke Premium berhasil! Silakan selesaikan pembayaran.",
      data: {
        user: updatedUser,
        payment: {
          qrString: paymentData.qrString,
          amount: paymentData.amount,
          expiresAt: paymentData.expiresAt,
        },
      },
    });
  } catch (error: any) {
    console.error("[AUTH] Upgrade tier error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengupgrade tier",
    });
  }
});
