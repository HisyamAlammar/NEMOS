/**
 * services/xendit.service.ts — HANYA logika Xendit di sini (Rule 3)
 *
 * Tidak boleh import ethers, alchemy, atau blockchain logic apapun.
 */
import { env } from "../config/env";

// ── TYPES ─────────────────────────────────────────────────
interface CreateQrisParams {
  externalId: string;
  amount: number;
  description: string;
}

interface QrisResponse {
  qrString: string;
  externalId: string;
  amount: number;
  status: string;
  expiresAt: string;
}

// ── XENDIT API BASE ───────────────────────────────────────
const XENDIT_BASE_URL = "https://api.xendit.co";

function getAuthHeader(): string {
  const encoded = Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

// ── CREATE QRIS PAYMENT ───────────────────────────────────
export async function createQrisPayment(params: CreateQrisParams): Promise<QrisResponse> {
  const body = {
    reference_id: params.externalId,
    type: "DYNAMIC",
    currency: "IDR",
    amount: params.amount,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    channel_code: "ID_DANA",
    checkout_method: "ONE_TIME_PAYMENT",
    metadata: {
      source: "NEMOS",
      investmentId: params.externalId,
    },
  };

  const response = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
    method: "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type": "application/json",
      "api-version": "2022-07-31",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Xendit QRIS creation failed: ${response.status} — ${errorBody}`
    );
  }

  const data: any = await response.json();

  return {
    qrString: data.qr_string,
    externalId: data.reference_id,
    amount: data.amount,
    status: data.status,
    expiresAt: data.expires_at,
  };
}

// ── VERIFY WEBHOOK SIGNATURE ──────────────────────────────
export function verifyWebhookSignature(
  webhookToken: string,
  incomingToken: string
): boolean {
  if (!webhookToken) {
    console.warn("[XENDIT] ⚠️ Webhook token not configured — skipping verification (sandbox mode)");
    return true;
  }
  return webhookToken === incomingToken;
}
