/**
 * server.ts — Entry Point
 *
 * 1. Validasi env vars (Rule 8)
 * 2. Connect database
 * 3. Start BullMQ workers
 * 4. Start Express server
 */
import { env } from "./config/env"; // Rule 8: crash di sini jika env missing
import { app } from "./app";
import { prisma } from "./services/prisma.service";
import { startPaymentWorker } from "./workers/payment.worker";

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

  // 2. Start BullMQ worker
  try {
    startPaymentWorker();
    console.log("  ✅ BullMQ payment worker started (Upstash Redis)");
  } catch (error: any) {
    console.error("  ❌ BullMQ worker failed:", error.message);
    process.exit(1);
  }

  // 3. Start Express
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
