/**
 * lib/umkm.api.js — UMKM API Functions
 *
 * Sprint 6 [M-04]: Fetch UMKM data from backend API.
 * Falls back to null if API unavailable — frontend handles fallback.
 */
import { apiFetch } from './api';

/**
 * Get all UMKMs from backend.
 * @returns {Promise<{ data: Array, count: number } | null>}
 */
export async function fetchUmkmList() {
  try {
    const response = await apiFetch('/umkm', { skipAuth: true });
    return response;
  } catch (err) {
    console.warn('[UMKM_API] Failed to fetch UMKM list:', err.message);
    return null;
  }
}

/**
 * Get single UMKM detail from backend.
 * @param {string} id - UMKM database ID
 * @returns {Promise<{ data: object } | null>}
 */
export async function fetchUmkmDetail(id) {
  try {
    const response = await apiFetch(`/umkm/${id}`, { skipAuth: true });
    return response;
  } catch (err) {
    console.warn('[UMKM_API] Failed to fetch UMKM detail:', err.message);
    return null;
  }
}
