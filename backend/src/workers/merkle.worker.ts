/**
 * workers/merkle.worker.ts — Daily Merkle Root Batching with Redlock
 *
 * Cron job yang berjalan setiap hari pukul 23:59 WIB (16:59 UTC):
 * 1. Acquire distributed lock via Redlock (prevent dual-instance race)
 * 2. Query semua Transaction dengan status PENDING/BATCHING hari ini
 * 3. Compute Merkle root dari hashes transaksi
 * 4. Record ke Polygon via blockchain.service.ts
 * 5. Update semua Transaction status ke CONFIRMED
 *
 * Redlock ensures exactly-once execution across multiple server instances.
 */
import { Worker, Queue } from "bullmq";
import Redlock from "redlock";
import { createHash } from "crypto";
import { redisConnection } from "../services/queue.service";
import { prisma } from "../services/prisma.service";
import { recordMerkleRoot } from "../services/blockchain.service";

// ── REDLOCK SETUP ────────────────────────────────────────
// Uses the existing ioredis connection from queue.service
const redlock = new Redlock([redisConnection], {
  driftFactor: 0.01,
  retryCount: 0,      // INTENTIONAL: jangan retry — jika terkunci, instance lain sedang proses
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});

redlock.on("error", (error) => {
  // Redlock errors are not fatal — they just mean we couldn't acquire the lock
  if (error.name !== "ExecutionError") {
    console.error("[MERKLE] Redlock error:", error.message);
  }
});

// ── MERKLE QUEUE ─────────────────────────────────────────
export const merkleQueue = new Queue("nemos-merkle", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400,
      count: 100,
    },
    removeOnFail: {
      age: 604800,
    },
  },
});

// ── MERKLE TREE HELPER ───────────────────────────────────
/**
 * Simple Merkle root computation from an array of leaf hashes.
 * Each leaf is a SHA-256 hash of a transaction's key data.
 */
function computeMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) {
    return "0x" + "0".repeat(64); // Empty root
  }

  // Ensure even number of leaves by duplicating the last one
  let hashes = [...leaves];
  if (hashes.length % 2 !== 0) {
    hashes.push(hashes[hashes.length - 1]);
  }

  while (hashes.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1];
      // Sort to ensure deterministic ordering
      const combined = left <= right ? left + right : right + left;
      const hash = createHash("sha256").update(combined).digest("hex");
      nextLevel.push("0x" + hash);
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

/**
 * Create a leaf hash from transaction data.
 */
function createLeafHash(tx: { xenditId: string; amount: bigint; type: string; createdAt: Date }): string {
  const data = `${tx.xenditId}|${tx.amount.toString()}|${tx.type}|${tx.createdAt.toISOString()}`;
  return "0x" + createHash("sha256").update(data).digest("hex");
}

// ── BATCH PROCESSOR ──────────────────────────────────────
/**
 * Process a batch of transactions for a specific date.
 * Called by both the daily cron and the startup catch-up job.
 */
export async function processMerkleBatch(
  transactionIds: string[],
  batchDate: string
): Promise<string | null> {
  console.log(`[MERKLE] Processing batch for ${batchDate} — ${transactionIds.length} transactions`);

  // 1. Fetch full transaction data
  const transactions = await prisma.transaction.findMany({
    where: { id: { in: transactionIds } },
  });

  if (transactions.length === 0) {
    console.log(`[MERKLE] No transactions found for batch ${batchDate}`);
    return null;
  }

  // 2. Mark as BATCHING
  await prisma.transaction.updateMany({
    where: { id: { in: transactionIds } },
    data: { status: "BATCHING" },
  });

  // 3. Compute Merkle root
  const leaves = transactions.map(createLeafHash);
  const merkleRoot = computeMerkleRoot(leaves);
  console.log(`[MERKLE] Computed root: ${merkleRoot} from ${leaves.length} leaves`);

  // 4. Compute day number (Unix timestamp / 86400)
  const dateObj = new Date(batchDate + "T00:00:00Z");
  const dayNumber = Math.floor(dateObj.getTime() / 1000 / 86400);

  // 5. Record on Polygon
  let txHash: string;
  try {
    txHash = await recordMerkleRoot(dayNumber, merkleRoot, transactions.length);
  } catch (error: any) {
    // Rollback status to PENDING if blockchain TX fails
    await prisma.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { status: "PENDING" },
    });
    throw new Error(`[MERKLE] Blockchain TX failed for ${batchDate}: ${error.message}`);
  }

  // 6. Update all transactions with Merkle data + CONFIRMED status
  await Promise.all(
    transactions.map((tx, index) =>
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "CONFIRMED",
          merkleRoot,
          merkleLeaf: leaves[index],
          polygonTxHash: txHash,
        },
      })
    )
  );

  console.log(`[MERKLE] ✅ Batch ${batchDate} confirmed — TX: ${txHash}`);
  return txHash;
}

// ── DAILY CRON JOB LOGIC ─────────────────────────────────
async function runDailyMerkleBatch(): Promise<void> {
  // Get today's date boundaries (UTC)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const todayStr = todayStart.toISOString().split("T")[0];
  console.log(`[MERKLE] Starting daily batch for ${todayStr}`);

  // Find all PENDING transactions from today
  const pendingTxs = await prisma.transaction.findMany({
    where: {
      status: { in: ["PENDING", "BATCHING"] },
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
    select: { id: true },
  });

  if (pendingTxs.length === 0) {
    console.log(`[MERKLE] No pending transactions for ${todayStr}. Skipping batch.`);
    return;
  }

  const transactionIds = pendingTxs.map((tx) => tx.id);
  await processMerkleBatch(transactionIds, todayStr);
}

// ── MERKLE WORKER (BullMQ) ───────────────────────────────
export function startMerkleWorker(): void {
  const worker = new Worker(
    "nemos-merkle",
    async (job) => {
      const { transactionIds, date } = job.data;

      if (job.name === "daily-merkle-batch" || job.name === "catch-up-merkle-batch") {
        // Wrap with Redlock to prevent dual processing
        let lock;
        try {
          lock = await redlock.acquire([`nemos:merkle-batch-lock:${date}`], 300000);
          console.log(`[MERKLE] Lock acquired for ${date}`);

          if (transactionIds && transactionIds.length > 0) {
            await processMerkleBatch(transactionIds, date);
          } else {
            // Daily job without pre-specified IDs — find them
            await runDailyMerkleBatch();
          }
        } catch (err: any) {
          if (err.name === "ExecutionError") {
            // Lock not acquired — another instance is processing
            console.log("[MERKLE] Cron skipped — another instance holds the batch lock");
            return;
          }
          throw err; // Re-throw other errors for BullMQ retry
        } finally {
          if (lock) await lock.release().catch(console.error);
        }
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // Only 1 batch at a time
    }
  );

  worker.on("completed", (job) => {
    console.log(`[MERKLE] ✅ Job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`[MERKLE] ❌ Job failed: ${job?.id}`, error.message);
  });

  worker.on("error", (error) => {
    console.error("[MERKLE] Worker error:", error.message);
  });

  // Schedule daily repeatable job at 23:59 WIB (16:59 UTC)
  merkleQueue.add(
    "daily-merkle-batch",
    { date: new Date().toISOString().split("T")[0], transactionIds: [] },
    {
      repeat: {
        pattern: "59 16 * * *",  // 16:59 UTC = 23:59 WIB
      },
      jobId: "daily-merkle-cron",
    }
  ).then(() => {
    console.log("[MERKLE] Daily cron job scheduled at 23:59 WIB (16:59 UTC)");
  }).catch((err) => {
    console.error("[MERKLE] Failed to schedule daily cron:", err.message);
  });

  console.log("[MERKLE] Merkle worker started, waiting for jobs...");
}
