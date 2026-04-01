/**
 * server.ts — Entry Point
 *
 * 1. Validasi env vars (Rule 8)
 * 2. Connect database
 * 3. Run startup catch-up job (recover missed transactions)
 * 4. Start BullMQ workers (payment + merkle)
 * 5. Start Express server
 */
import { env } from "./config/env"; // Rule 8: crash di sini jika env missing
import { app } from "./app";
import { prisma } from "./services/prisma.service";
import { startPaymentWorker } from "./workers/payment.worker";
import { startMerkleWorker, merkleQueue } from "./workers/merkle.worker";

// ── STARTUP CATCH-UP JOB ─────────────────────────────────
/**
 * Recover transactions that were missed during server downtime.
 *
 * Checks for PENDING/BATCHING transactions from previous days
 * (before today's UTC midnight) and queues them for Merkle batching.
 *
 * This ensures no transactions are permanently stuck if the server
 * was down during the 23:59 cron job window.
 *
 * IMPORTANT: This function MUST NOT prevent server from starting.
 * All errors are caught and logged.
 */
async function runStartupCatchup(): Promise<void> {
  // UTC midnight of today
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Find transactions that should have been batched but weren't
  const missedTransactions = await prisma.transaction.findMany({
    where: {
      status: { in: ["PENDING", "BATCHING"] },
      createdAt: { lt: today },
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (missedTransactions.length === 0) {
    console.log("  ✅ [STARTUP] No missed transactions found. Catch-up not needed.");
    return;
  }

  console.log(
    `  ⚠️ [STARTUP] Found ${missedTransactions.length} missed transactions from previous days. ` +
    `Initiating catch-up Merkle batch...`
  );

  // Group transactions by date (YYYY-MM-DD)
  const groupedByDate = new Map<string, string[]>();
  for (const tx of missedTransactions) {
    const dateKey = tx.createdAt.toISOString().split("T")[0];
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(tx.id);
  }

  // Queue a catch-up job for each date group
  const dates: string[] = [];
  for (const [date, transactionIds] of groupedByDate) {
    await merkleQueue.add(
      "catch-up-merkle-batch",
      { transactionIds, date },
      {
        jobId: `catch-up-${date}-${Date.now()}`,
      }
    );
    dates.push(`${date} (${transactionIds.length} txs)`);
  }

  console.log(`  ✅ [STARTUP] Catch-up jobs queued for dates: ${dates.join(", ")}`);
}

// ── BOOTSTRAP ────────────────────────────────────────────
async function bootstrap() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  NEMOS Backend API — Starting...");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Port:        ${env.PORT}`);
  console.log("───────────────────────────────────────────────────");

  // 1. Test database connection
  try {
    await prisma.$connect();
    console.log("  ✅ PostgreSQL connected (Neon)");
  } catch (error: any) {
    console.error("  ❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }

  // 2. Run startup catch-up (MUST NOT prevent server from starting)
  try {
    await runStartupCatchup();
  } catch (err: any) {
    console.error("  ⚠️ [STARTUP] Catch-up job failed — server will continue:", err.message);
    // Jangan throw — server harus tetap start
  }

  // 3. Start BullMQ workers
  try {
    startPaymentWorker();
    console.log("  ✅ BullMQ payment worker started (Upstash Redis)");
  } catch (error: any) {
    console.error("  ❌ BullMQ payment worker failed:", error.message);
    process.exit(1);
  }

  try {
    startMerkleWorker();
    console.log("  ✅ BullMQ merkle worker started");
  } catch (error: any) {
    console.error("  ❌ BullMQ merkle worker failed:", error.message);
    process.exit(1);
  }

  // 4. Start Express
  app.listen(env.PORT, () => {
    console.log("───────────────────────────────────────────────────");
    console.log(`  🚀 Server running at http://localhost:${env.PORT}`);
    console.log(`  📋 Health check: http://localhost:${env.PORT}/api/health`);
    console.log("═══════════════════════════════════════════════════\n");
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏹ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error("❌ Bootstrap FAILED:", error);
  process.exit(1);
});
