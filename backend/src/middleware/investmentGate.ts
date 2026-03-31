/**
 * middleware/investmentGate.ts — Magic Moment 1: Investment Gate
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  INI ADALAH FITUR KUNCI UNTUK DEMO JURI BANK INDONESIA  ║
 * ║                                                          ║
 * ║  Investment Gate memblokir investasi di LEVEL API —       ║
 * ║  bukan hanya di UI. User yang belum menyelesaikan        ║
 * ║  kurikulum literasi tidak bisa invest sama sekali.        ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Logic:
 * - Cek learningProgress user dari database
 * - Jika < 100 (belum selesai semua modul), TOLAK investasi
 * - Jika >= 100, lanjutkan ke handler berikutnya
 *
 * Ini memastikan bahwa meskipun seseorang bypass UI,
 * API tetap memblokir akses. Ini yang membedakan NEMOS
 * dari platform investasi lain.
 */
import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.service";

// Minimum progress yang diperlukan untuk bisa invest
const REQUIRED_LEARNING_PROGRESS = 100;

export async function investmentGateMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // User harus sudah terautentikasi (authMiddleware harus dipanggil duluan)
    if (!req.user) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Autentikasi diperlukan",
      });
      return;
    }

    // Fetch learning progress dari database (source of truth)
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        learningProgress: true,
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "User tidak ditemukan",
      });
      return;
    }

    // Hanya investor yang butuh investment gate
    if (user.role !== "INVESTOR") {
      res.status(403).json({
        error: "FORBIDDEN",
        message: "Hanya investor yang bisa melakukan investasi",
      });
      return;
    }

    // ── INVESTMENT GATE CHECK ─────────────────────────────
    if (user.learningProgress < REQUIRED_LEARNING_PROGRESS) {
      res.status(403).json({
        error: "INVESTMENT_GATE_BLOCKED",
        message: `Anda harus menyelesaikan seluruh modul literasi keuangan sebelum dapat berinvestasi. Progress saat ini: ${user.learningProgress}%`,
        data: {
          currentProgress: user.learningProgress,
          requiredProgress: REQUIRED_LEARNING_PROGRESS,
          remainingModules: Math.ceil(
            (REQUIRED_LEARNING_PROGRESS - user.learningProgress) / (100 / 7)
          ),
        },
      });
      return;
    }

    // ✅ Gate passed — user boleh invest
    next();
  } catch (error: any) {
    console.error("[INVESTMENT_GATE] Error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal memverifikasi status literasi",
    });
  }
}
