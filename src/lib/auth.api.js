/**
 * lib/auth.api.js — Auth API Functions
 *
 * Wraps backend auth endpoints.
 * Currently returns mock data matching the backend response format.
 * Will switch to real API calls when backend is ready.
 */
import { apiFetch } from './api';

// ── FLAG: Toggle between mock and real API ────────────────
const USE_MOCK = false; // Set to false when backend is live

// ── MOCK DATA ─────────────────────────────────────────────
const MOCK_USER = {
  id: 'mock-user-001',
  email: 'investor@nemos.id',
  name: 'Demo Investor',
  role: 'INVESTOR',
  tier: 'FREE',
  riskProfile: null,
  learningProgress: 0,
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock-jwt-token-for-development';

// ── REGISTER ──────────────────────────────────────────────
/**
 * Register a new user.
 * @param {{ email: string, password: string, name: string, role: 'INVESTOR' | 'UMKM_OWNER' }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function registerUser(data) {
  if (USE_MOCK) {
    await _delay(500);
    return {
      message: 'Registrasi berhasil',
      data: { user: { ...MOCK_USER, ...data }, token: MOCK_TOKEN },
    };
  }

  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

// ── LOGIN ─────────────────────────────────────────────────
/**
 * Login with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginUser(credentials) {
  if (USE_MOCK) {
    await _delay(500);
    return {
      message: 'Login berhasil',
      data: { user: MOCK_USER, token: MOCK_TOKEN },
    };
  }

  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    skipAuth: true,
  });
}

// ── GET CURRENT USER ──────────────────────────────────────
/**
 * Get current authenticated user.
 * @returns {Promise<{ data: object }>}
 */
export async function getMe() {
  if (USE_MOCK) {
    await _delay(200);
    return { data: MOCK_USER };
  }

  return apiFetch('/auth/me');
}

// ── HELPER ────────────────────────────────────────────────
function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
