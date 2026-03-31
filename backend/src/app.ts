/**
 * app.ts — Express Application Setup
 *
 * Separation: app.ts hanya mendefinisikan middleware dan routes.
 * server.ts yang menjalankan listen().
 */
import express from "express";
import cors from "cors";

// Routes
import { authRouter } from "./routes/auth.routes";
import { investRouter } from "./routes/invest.routes";
import { webhookRouter } from "./routes/webhook.routes";

const app = express();

// ── GLOBAL MIDDLEWARE ─────────────────────────────────────

// CORS untuk frontend (Vercel)
app.use(cors({
  origin: [
    "http://localhost:5173",      // Vite dev server
    "http://localhost:3000",      // Next.js dev server
    "https://nemos-three.vercel.app", // Production
  ],
  credentials: true,
}));

// Webhook route HARUS pakai raw body untuk verifikasi signature
// Jadi kita mount webhook SEBELUM express.json()
app.use("/api/webhooks", webhookRouter);

// JSON parser untuk semua route lain
app.use(express.json({ limit: "10mb" }));

// ── ROUTES ────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api", investRouter);

// ── HEALTH CHECK ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NEMOS Backend API",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 HANDLER ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint tidak ditemukan",
  });
});

// ── ERROR HANDLER ─────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[ERROR]", err.message);
  console.error(err.stack);

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: err.message || "Terjadi kesalahan internal",
  });
});

export { app };
