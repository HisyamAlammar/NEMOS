/**
 * routes/blockchain.routes.ts — Blockchain API Endpoints
 *
 * Public read endpoints for on-chain verification.
 * Admin write endpoints for manual Merkle root recording.
 *
 * Rule 3: Routes hanya validasi input, logic di blockchain.service.ts
 */
import { Router, Request, Response } from "express";
import {
  getRelayerInfo,
  getOnChainStats,
  recordMerkleRoot,
  recordTranche,
  verifyProofOnChain,
  hashTransactionLeaf,
  buildMerkleTree,
} from "../services/blockchain.service";

const router = Router();

// ══════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (no auth required)
// ══════════════════════════════════════════════════════════

/**
 * GET /blockchain/health
 * Check relayer wallet status and contract connection.
 */
router.get("/health", async (_req: Request, res: Response): Promise<void> => {
  try {
    const info = await getRelayerInfo();
    res.json({
      status: "ok",
      relayer: info.address,
      balance: `${info.balance} MATIC`,
      balanceSufficient: info.sufficient,
    });
  } catch (error: any) {
    res.status(503).json({
      status: "error",
      message: error.message,
    });
  }
});

/**
 * GET /blockchain/stats
 * Get on-chain statistics for dashboard display.
 */
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getOnChainStats();
    res.json({ data: stats });
  } catch (error: any) {
    res.status(500).json({
      error: "BLOCKCHAIN_ERROR",
      message: error.message,
    });
  }
});

/**
 * POST /blockchain/verify-proof
 * Verify a Merkle proof on-chain.
 *
 * Body: { dayNumber, proof: string[], leaf: string }
 */
router.post("/verify-proof", async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayNumber, proof, leaf } = req.body;

    if (!dayNumber || !proof || !leaf) {
      res.status(400).json({
        error: "MISSING_PARAMS",
        message: "dayNumber, proof, and leaf are required",
      });
      return;
    }

    const isValid = await verifyProofOnChain(dayNumber, proof, leaf);

    res.json({
      data: {
        valid: isValid,
        dayNumber,
        leaf,
        proofLength: proof.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "VERIFICATION_FAILED",
      message: error.message,
    });
  }
});

// ══════════════════════════════════════════════════════════
// ADMIN ENDPOINTS (should be protected in production)
// ══════════════════════════════════════════════════════════

/**
 * POST /blockchain/record-merkle
 * Manually trigger Merkle root recording for a specific day.
 *
 * Body: { transactions: [{ xenditId, amount, timestamp }] }
 *
 * In production, this would be triggered by a cron job.
 */
router.post("/record-merkle", async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({
        error: "INVALID_INPUT",
        message: "transactions array is required and must not be empty",
      });
      return;
    }

    // Build leaves from transactions
    const leaves = transactions.map((tx: { xenditId: string; amount: number; timestamp: number }) =>
      hashTransactionLeaf(tx.xenditId, BigInt(tx.amount), tx.timestamp)
    );

    // Build Merkle tree
    const tree = buildMerkleTree(leaves);

    // Calculate day number from first transaction
    const dayNumber = Math.floor(transactions[0].timestamp / 86400);

    // Record on-chain
    const result = await recordMerkleRoot(dayNumber, tree.root, transactions.length);

    res.json({
      message: "Merkle root recorded successfully",
      data: {
        dayNumber,
        merkleRoot: tree.root,
        txCount: transactions.length,
        txHash: result.txHash,
        blockNumber: result.blockNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "RECORD_FAILED",
      message: error.message,
    });
  }
});

/**
 * POST /blockchain/record-tranche
 * Record a tranche disbursement on-chain.
 *
 * Body: { umkmId, trancheId, amountIdr, trancheStage, aiScore }
 */
router.post("/record-tranche", async (req: Request, res: Response): Promise<void> => {
  try {
    const { umkmId, trancheId, amountIdr, trancheStage, aiScore } = req.body;

    if (!umkmId || !trancheId || !amountIdr || !trancheStage || aiScore === undefined) {
      res.status(400).json({
        error: "MISSING_PARAMS",
        message: "umkmId, trancheId, amountIdr, trancheStage, and aiScore are required",
      });
      return;
    }

    const result = await recordTranche(
      umkmId,
      trancheId,
      amountIdr,
      trancheStage,
      aiScore
    );

    res.json({
      message: "Tranche disbursement recorded on-chain",
      data: {
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        disbursementId: result.disbursementId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "TRANCHE_RECORD_FAILED",
      message: error.message,
    });
  }
});

export default router;
