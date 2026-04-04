/**
 * routes/umkm.routes.ts — UMKM Public Listing Endpoints
 *
 * GET /api/umkm       — List all UMKMs (public, no auth)
 * GET /api/umkm/:id   — Get single UMKM detail (public, no auth)
 *
 * These are read-only endpoints for the Arena and Detail pages.
 * Sprint 6 [M-04]: Replaces hardcoded frontend UMKM_DATA.
 */
import { Router, Request, Response } from "express";
import { prisma } from "../services/prisma.service";
import { authMiddleware } from "../middleware/auth";

export const umkmRouter = Router();

// ── LIST ALL UMKM ────────────────────────────────────────
umkmRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const umkmList = await prisma.uMKM.findMany({
      include: {
        owner: {
          select: { name: true },
        },
        investments: {
          where: { status: "ACTIVE" },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform BigInt to Number for JSON serialization
    const serialized = umkmList.map((u) => ({
      id: u.id,
      name: u.name,
      location: u.location,
      category: u.category,
      grade: u.grade,
      target: Number(u.target),
      current: Number(u.current),
      rbfRate: u.rbfRate,
      description: u.description,
      imageUrl: u.imageUrl,
      ownerName: u.owner.name,
      investorCount: u.investments.length,
      fundedPercent: u.target > 0n
        ? Math.round((Number(u.current) / Number(u.target)) * 100)
        : 0,
    }));

    res.json({
      status: "ok",
      data: serialized,
      count: serialized.length,
    });
  } catch (error: any) {
    console.error("[UMKM] List error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengambil daftar UMKM",
    });
  }
});

// ── GET UMKM FOR LOGGED IN OWNER ─────────────────────────
umkmRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const umkm = await prisma.uMKM.findUnique({
      where: { ownerId: userId },
      include: {
        investments: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
            transactions: {
              where: { status: "CONFIRMED" },
              select: { createdAt: true, amount: true },
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    });

    if (!umkm) {
      res.status(404).json({ error: "NOT_FOUND", message: "Anda belum memiliki data UMKM" });
      return;
    }

    const serialized = {
      ...umkm,
      target: Number(umkm.target),
      current: Number(umkm.current),
      investments: umkm.investments.map(i => ({
        id: i.id,
        investorName: i.user.name,
        amount: Number(i.amount),
        createdAt: i.createdAt,
        status: i.status
      }))
    };

    res.json({ data: serialized });
  } catch (error: any) {
    console.error("[UMKM] Get Me error:", error.message);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Gagal mengambil data UMKM Anda" });
  }
});

// ── GET SINGLE UMKM DETAIL ───────────────────────────────
umkmRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const umkm: any = await prisma.uMKM.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        investments: {
          where: { status: "ACTIVE" },
          take: 10, // [PERF-P1-05] Limit to prevent unbounded memory
          orderBy: { createdAt: "desc" },
          include: {
            transactions: {
              where: { status: "CONFIRMED" },
              select: {
                polygonTxHash: true,
                merkleRoot: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!umkm) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "UMKM tidak ditemukan",
      });
      return;
    }

    // Get the latest real polygon TX hash from confirmed transactions
    const allTxHashes = umkm.investments
      .flatMap((inv: any) => inv.transactions)
      .filter((tx: any) => tx.polygonTxHash)
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

    const latestTxHash = allTxHashes.length > 0
      ? allTxHashes[0].polygonTxHash
      : null;

    const ownerYears = Math.max(
      1,
      Math.floor(
        (Date.now() - umkm.owner.createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    );

    res.json({
      status: "ok",
      data: {
        id: umkm.id,
        name: umkm.name,
        location: umkm.location,
        category: umkm.category,
        grade: umkm.grade,
        target: Number(umkm.target),
        current: Number(umkm.current),
        rbfRate: umkm.rbfRate,
        description: umkm.description,
        imageUrl: umkm.imageUrl,
        ownerName: umkm.owner.name,
        ownerYears,
        investorCount: umkm.investments.length,
        fundedPercent: umkm.target > 0n
          ? Math.round((Number(umkm.current) / Number(umkm.target)) * 100)
          : 0,
        latestTxHash,
        createdAt: umkm.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[UMKM] Detail error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengambil detail UMKM",
    });
  }
});
