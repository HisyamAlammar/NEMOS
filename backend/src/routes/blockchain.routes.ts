/**
 * routes/blockchain.routes.ts — Blockchain Admin Endpoints
 *
 * POST /api/blockchain/record-merkle  — Record Merkle root on Polygon (ADMIN ONLY)
 * POST /api/blockchain/record-tranche — Record tranche release on Polygon (ADMIN ONLY)
 * GET  /api/blockchain/health         — Public health check
 * GET  /api/blockchain/stats          — Public contract stats
 *
 * Security:
 *   - POST routes require authMiddleware (JWT) + adminGuard
 *   - adminGuard uses dual-path authentication:
 *     Path 1: JWT role === 'ADMIN' (future-proof, currently no ADMIN in Role enum)
 *     Path 2: x-internal-secret header (for merkle.worker.ts cron job)
 *   - GET routes are public read-only
 *
 * ⚠️ CONFIRMED: Prisma enum Role = { INVESTOR, UMKM_OWNER } — no ADMIN value.
 *   Decision: Keep dual-path (role check + internal secret) to avoid migration risk
 *   before demo. The internal secret path is the active path for merkle.worker.ts.
 *   If ADMIN is added to enum later, Path 1 will automatically activate.
 *
 * Guards against Bug C-02: Previously these POST endpoints were completely public,
 * allowing anyone to write fake data to Polygon and drain the MATIC relayer wallet.
 */
import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middleware/auth";
import { recordMerkleRoot, recordTranche, getContractStats } from "../services/blockchain.service";

export const blockchainRouter = Router();

// ── ADMIN GUARD MIDDLEWARE ────────────────────────────────
function adminGuard(req: Request, res: Response, next: NextFunction): void {
  // Path 1: JWT-authenticated user with ADMIN role
  if (req.user?.role === "ADMIN") {
    next();
    return;
  }

  // Path 2: Internal service-to-service authentication
  const internalSecret = req.headers["x-internal-secret"];
  const expectedSecret = process.env.ADMIN_INTERNAL_SECRET;

  if (!expectedSecret) {
    console.error(
      "[ADMIN_GUARD] ADMIN_INTERNAL_SECRET not set in environment. " +
      "All admin requests will be rejected."
    );
    res.status(403).json({
      error: "FORBIDDEN",
      message: "Forbidden: admin access required",
    });
    return;
  }

  if (typeof internalSecret === "string" && internalSecret.length > 0 && internalSecret === expectedSecret) {
    next();
    return;
  }

  res.status(403).json({
    error: "FORBIDDEN",
    message: "Forbidden: admin access required",
  });
}

// ── HANDLER: Record Merkle Root ───────────────────────────
async function handleRecordMerkleRoot(req: Request, res: Response): Promise<void> {
  try {
    const { merkleRoot, transactionIds, batchDate } = req.body;

    if (!merkleRoot || !transactionIds || !batchDate) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "merkleRoot, transactionIds, dan batchDate wajib diisi",
      });
      return;
    }

    // Compute day number from batchDate string
    const dateObj = new Date(batchDate + "T00:00:00Z");
    const dayNumber = Math.floor(dateObj.getTime() / 1000 / 86400);

    const txHash = await recordMerkleRoot(dayNumber, merkleRoot, transactionIds.length);

    res.status(200).json({
      message: "Merkle root recorded on Polygon",
      data: {
        merkleRoot,
        batchDate,
        dayNumber,
        txCount: transactionIds.length,
        polygonTxHash: txHash,
      },
    });
  } catch (error: any) {
    console.error("[BLOCKCHAIN] recordMerkleRoot error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal merekam merkle root: " + error.message,
    });
  }
}

// ── HANDLER: Record Tranche ──────────────────────────────
async function handleRecordTranche(req: Request, res: Response): Promise<void> {
  try {
    const { umkmId, trancheId, amountIdr, trancheStage, aiScore } = req.body;

    if (!umkmId || !trancheId || !amountIdr || trancheStage === undefined || aiScore === undefined) {
      res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "umkmId, trancheId, amountIdr, trancheStage, dan aiScore wajib diisi",
      });
      return;
    }

    const txHash = await recordTranche(umkmId, trancheId, amountIdr, trancheStage, aiScore);

    res.status(200).json({
      message: "Tranche recorded on Polygon",
      data: {
        umkmId,
        trancheId,
        amountIdr,
        trancheStage,
        aiScore,
        polygonTxHash: txHash,
      },
    });
  } catch (error: any) {
    console.error("[BLOCKCHAIN] recordTranche error:", error.message);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal merekam tranche: " + error.message,
    });
  }
}

// ── ROUTES ────────────────────────────────────────────────

// Protected POST routes — require JWT auth + admin guard (dual-path)
blockchainRouter.post("/record-merkle", authMiddleware, adminGuard, handleRecordMerkleRoot);
blockchainRouter.post("/record-tranche", authMiddleware, adminGuard, handleRecordTranche);

// Public GET routes — read-only, no auth needed
blockchainRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "NEMOS Blockchain Routes",
    timestamp: new Date().toISOString(),
  });
});

blockchainRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await getContractStats();
    res.json({ status: "ok", data: stats });
  } catch (error: any) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Gagal mengambil stats blockchain: " + error.message,
    });
  }
});
