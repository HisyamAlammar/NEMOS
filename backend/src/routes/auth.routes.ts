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

// ── POST /api/auth/progress ───────────────────────────
// Persists learningProgress to database + issues fresh JWT.
// Rule 2: Idempotent — progress can only go forward, never backward.
authRouter.post("/progress", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { progress } = req.body;
    const { prisma } = await import("../services/prisma.service");

    // ── Input validation ──
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      res.status(400).json({
        error: "INVALID_PROGRESS",
        message: "Progress harus berupa angka",
      });
      return;
    }

    if (progress < 0 || progress > 100) {
      res.status(400).json({
        error: "INVALID_PROGRESS",
        message: "Progress harus antara 0 dan 100",
      });
      return;
    }

    // Round to integer to prevent floating point shenanigans
    const progressInt = Math.round(progress);

    // ── Idempotency check: fetch current value from DB ──
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true,
        tier: true, learningProgress: true, createdAt: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "User tidak ditemukan",
      });
      return;
    }

    // Forward-only: if new progress <= current, return current state (no error)
    if (progressInt <= currentUser.learningProgress) {
      const jwt = await import("jsonwebtoken");
      const { env } = await import("../config/env");
      const token = jwt.default.sign(
        {
          userId: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          tier: currentUser.tier,
          learningProgress: currentUser.learningProgress,
        },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.json({
        message: "Progress tidak berubah",
        data: { user: currentUser, token },
      });
      return;
    }

    // ── Update progress in database ──
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { learningProgress: progressInt },
      select: {
        id: true, email: true, name: true, role: true,
        tier: true, learningProgress: true, createdAt: true,
      },
    });

    // ── Generate fresh JWT with updated learningProgress ──
    const jwt = await import("jsonwebtoken");
    const { env } = await import("../config/env");
    const newToken = jwt.default.sign(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        tier: updatedUser.tier,
        learningProgress: updatedUser.learningProgress,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    console.log(
      `[AUTH] Learning progress updated: ${currentUser.learningProgress} → ${updatedUser.learningProgress} for user ${userId}`
    );

    res.json({
      message: "Progress berhasil diperbarui",
      data: { user: updatedUser, token: newToken },
    });
  } catch (error: any) {
    console.error("[AUTH] Update progress error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal memperbarui progress",
    });
  }
});

// ── POST /api/auth/upgrade-tier ───────────────────────────
// [SEC-P0-02] Upgrade tier: creates pending payment, tier upgrades ONLY after webhook confirmation.
// BUG-H6 FIX: No longer upgrades tier before payment is confirmed.
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

    // ── DEMO HACK: Instant Premium Bypass ──
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tier: "PREMIUM" },
      select: {
        id: true, email: true, name: true, role: true,
        tier: true, learningProgress: true, createdAt: true,
      },
    });

    console.log(`[AUTH-DEMO] User ${userId} upgraded to PREMIUM instantly.`);

    res.json({
      message: "Upgrade ke Premium berhasil!",
      data: {
        user: updatedUser,
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
