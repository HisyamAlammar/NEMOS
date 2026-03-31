/**
 * config/env.ts — Environment Variable Validation at Startup (Rule 8)
 *
 * Semua env var divalidasi SEKALI di sini saat server boot.
 * Jika ada yang hilang, crash dengan pesan yang jelas.
 * Tidak ada silent runtime failure.
 */
import * as dotenv from "dotenv";
dotenv.config();

// ── VALIDATION ────────────────────────────────────────────
const requiredEnvVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "XENDIT_SECRET_KEY",
  "NEMOS_CONTRACT_ADDRESS",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `STARTUP FAILED: Missing required environment variable: ${envVar}\n` +
      `Copy .env.example to .env and fill in all values.`
    );
  }
}

// ── EXPORT TYPED CONFIG ───────────────────────────────────
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Redis
  REDIS_URL: process.env.REDIS_URL!,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Xendit
  XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY!,
  XENDIT_WEBHOOK_TOKEN: process.env.XENDIT_WEBHOOK_TOKEN || "", // Optional di sandbox

  // Blockchain
  NEMOS_CONTRACT_ADDRESS: process.env.NEMOS_CONTRACT_ADDRESS!,
  POLYGON_AMOY_RPC: process.env.POLYGON_AMOY_RPC || "",
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY || "",

  // Server
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Derived
  get isDev(): boolean {
    return this.NODE_ENV === "development";
  },
} as const;
