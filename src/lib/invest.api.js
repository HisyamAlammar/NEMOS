/**
 * lib/invest.api.js — Investment API Functions
 *
 * Wraps backend investment endpoints.
 * Currently returns mock data matching data.js structure
 * while backend invest endpoints are being finalized.
 */
import { apiFetch, aiFetch } from './api';
import { umkmData } from '../data';

// ── FLAG: Toggle between mock and real API ────────────────
const USE_MOCK = true; // Set to false when backend invest endpoints are ready

// ── GET ALL UMKM ──────────────────────────────────────────
/**
 * Fetch list of available UMKM for investment.
 * @returns {Promise<object[]>}
 */
export async function getUmkmList() {
  if (USE_MOCK) {
    await _delay(300);
    return { data: umkmData };
  }

  return apiFetch('/umkm');
}

// ── GET UMKM BY ID ────────────────────────────────────────
/**
 * Fetch single UMKM detail.
 * @param {string|number} id
 * @returns {Promise<object>}
 */
export async function getUmkmById(id) {
  if (USE_MOCK) {
    await _delay(200);
    const umkm = umkmData.find((u) => u.id === Number(id));
    if (!umkm) throw new Error('UMKM tidak ditemukan');
    return { data: umkm };
  }

  return apiFetch(`/umkm/${id}`);
}

// ── CREATE INVESTMENT ─────────────────────────────────────
/**
 * Create a new investment (guarded by Investment Gate).
 * @param {{ umkmId: string, amount: number }} data
 * @returns {Promise<{ investmentId: string, payment: object }>}
 */
export async function createInvestment(data) {
  if (USE_MOCK) {
    await _delay(800);
    return {
      message: 'Investasi berhasil dibuat',
      data: {
        investmentId: `mock-inv-${Date.now()}`,
        payment: {
          qrString: 'mock-qr-string',
          amount: data.amount,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      },
    };
  }

  return apiFetch('/invest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── VERIFY RECEIPT (AI Service) ───────────────────────────
/**
 * Send receipt image to AI service for verification.
 * @param {File} file - Receipt image file
 * @returns {Promise<{ confidence: number, extracted: object, status: string }>}
 */
export async function verifyReceipt(file) {
  const formData = new FormData();
  formData.append('receipt', file);

  // This always calls the real AI service (no mock)
  return aiFetch('/ocr/verify-receipt', {
    method: 'POST',
    body: formData,
    // No Content-Type header — browser sets it with boundary for FormData
  });
}

// ── GET INVESTOR PORTFOLIO ────────────────────────────────
/**
 * Get current user's investment portfolio.
 * @returns {Promise<object[]>}
 */
export async function getPortfolio() {
  if (USE_MOCK) {
    await _delay(300);
    return {
      data: [
        {
          id: 'mock-inv-1',
          umkm: umkmData[0],
          amount: 2000000,
          status: 'ACTIVE',
          createdAt: '2026-03-15T10:00:00Z',
          tranches: [
            { stage: 1, amount: 1200000, aiVerified: false, releasedAt: '2026-03-16T10:00:00Z' },
          ],
        },
        {
          id: 'mock-inv-2',
          umkm: umkmData[3],
          amount: 1000000,
          status: 'PENDING',
          createdAt: '2026-03-28T14:30:00Z',
          tranches: [],
        },
      ],
    };
  }

  return apiFetch('/investments');
}

// ── HELPER ────────────────────────────────────────────────
function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
