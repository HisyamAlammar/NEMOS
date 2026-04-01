/**
 * lib/invest.api.js — Investment API Functions
 *
 * Sprint 6 [P0-NEW-02]: Wire frontend to POST /api/invest.
 * Sprint 6 [P0-NEW-03]: Wire frontend to tier upgrade.
 */
import { apiFetch } from './api';

/**
 * Create a new investment via Xendit QRIS.
 * Requires authenticated user with learningProgress >= 100.
 *
 * @param {string} umkmId - Target UMKM database ID
 * @param {number} amount - Investment amount in IDR (min 100,000)
 * @returns {Promise<{ data: { investmentId, payment: { qrString, amount, expiresAt }, umkm } }>}
 */
export async function createInvestment(umkmId, amount) {
    return apiFetch('/invest', {
        method: 'POST',
        body: JSON.stringify({ umkmId, amount }),
    });
}

/**
 * Upgrade user tier to PREMIUM.
 * For hackathon/demo: instantly updates tier in DB.
 *
 * @returns {Promise<{ data: { tier: string } }>}
 */
export async function upgradeToPremium() {
    return apiFetch('/auth/upgrade-tier', {
        method: 'POST',
        body: JSON.stringify({ tier: 'PREMIUM' }),
    });
}
