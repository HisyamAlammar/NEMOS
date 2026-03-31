/**
 * lib/blockchain.api.js — Blockchain Verification API
 *
 * Frontend calls to backend /api/blockchain endpoints.
 * Used for Magic Moment 3: clickable Polygonscan links.
 */
import { apiFetch } from './api';

// Polygon Amoy Explorer base URL
export const POLYGONSCAN_BASE = 'https://amoy.polygonscan.com';

/**
 * Get blockchain health (relayer balance).
 */
export async function getBlockchainHealth() {
  return apiFetch('/blockchain/health', { skipAuth: true });
}

/**
 * Get on-chain stats (total days, disbursements).
 */
export async function getBlockchainStats() {
  return apiFetch('/blockchain/stats', { skipAuth: true });
}

/**
 * Verify a Merkle proof on-chain.
 * @param {{ dayNumber: number, proof: string[], leaf: string }} data
 */
export async function verifyMerkleProof(data) {
  return apiFetch('/blockchain/verify-proof', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

/**
 * Get Polygonscan URL for a transaction hash.
 * @param {string} txHash
 * @returns {string}
 */
export function getPolygonscanTxUrl(txHash) {
  return `${POLYGONSCAN_BASE}/tx/${txHash}`;
}

/**
 * Get Polygonscan URL for the contract.
 * @param {string} contractAddress
 * @returns {string}
 */
export function getPolygonscanContractUrl(contractAddress) {
  return `${POLYGONSCAN_BASE}/address/${contractAddress}`;
}
