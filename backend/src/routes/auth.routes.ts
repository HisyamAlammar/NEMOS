/**
 * routes/auth.routes.ts — Authentication Endpoints
 *
 * POST /api/auth/register — Daftar user baru
 * POST /api/auth/login    — Login dan dapat token
 * GET  /api/auth/me       — Get current user (protected)
 */
import { Router, Request, Response } from "express";
import { registerUser, loginUser, getCurrentUser, AppError } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth";

export const authRouter = Router();

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
// Sprint 6 [P0-NEW-03]: Upgrade user tier to PREMIUM
authRouter.post("/upgrade-tier", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { prisma } = await import("../services/prisma.service");

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
      message: "Upgrade ke Premium berhasil!",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("[AUTH] Upgrade tier error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengupgrade tier",
    });
  }
});
