/**
 * services/queue.service.ts — HANYA logika BullMQ di sini (Rule 3)
 *
 * Tidak boleh import ethers, xendit, atau logika bisnis apapun.
 * Service ini bertanggung jawab untuk:
 *   1. Mengelola Redis connection via ioredis
 *   2. Mengelola BullMQ Queue (enqueue jobs)
 */
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";

// ── REDIS CONNECTION ──────────────────────────────────────
// Upstash Redis requires TLS (rediss://)
export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
});

redisConnection.on("error", (err) => {
  console.error("[REDIS] Connection error:", err.message);
});

redisConnection.on("connect", () => {
  console.log("  ✅ Redis connected (Upstash)");
});

// ── PAYMENT QUEUE ─────────────────────────────────────────
export const paymentQueue = new Queue("nemos-payment", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,           // Retry 3x jika gagal
    backoff: {
      type: "exponential",
      delay: 2000,         // 2s, 4s, 8s
    },
    removeOnComplete: {
      age: 86400,          // Hapus setelah 24 jam
      count: 1000,         // Simpan max 1000 completed jobs
    },
    removeOnFail: {
      age: 604800,         // Simpan failed jobs 7 hari untuk debugging
    },
  },
});

// ── ENQUEUE PAYMENT JOB ───────────────────────────────────
interface PaymentJobData {
  xenditId: string;        // Idempotency Key (Rule 2)
  externalId: string;      // Investment ID
  amount: number;
  type: "INVESTMENT" | "REPAYMENT";
  rawPayload: Record<string, unknown>;
}

export async function enqueuePaymentJob(data: PaymentJobData): Promise<string> {
  // Job ID = xenditId → ensures exactly-once processing (Rule 2)
  const job = await paymentQueue.add("process-payment", data, {
    jobId: `payment-${data.xenditId}`, // Deduplicate by xenditId
  });

  console.log(`[QUEUE] Payment job enqueued: ${job.id}`);
  return job.id!;
}
