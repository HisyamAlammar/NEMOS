/**
 * lib/api.js — Base Fetch Wrapper
 *
 * Centralized API client with:
 * - Auto-inject Authorization header from auth store
 * - Base URL switching (dev vs production)
 * - Consistent error handling
 * - JSON serialization
 */

// ── BASE URL CONFIG ───────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

/**
 * Get auth token from localStorage.
 * We use localStorage here instead of importing the store directly
 * to avoid circular dependencies.
 */
function getAuthToken() {
  try {
    const authStorage = localStorage.getItem('nemos-auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }
  } catch {
    // Silent fail — no token available
  }
  return null;
}

/**
 * Base fetch wrapper with auth header injection.
 *
 * @param {string} url - Full URL or relative path (will prepend API_BASE_URL)
 * @param {RequestInit & { skipAuth?: boolean }} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiFetch(url, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Auto-inject auth token
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
  });

  // Parse response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetch wrapper for AI service (no auth needed).
 */
export async function aiFetch(path, options = {}) {
  const response = await fetch(`${AI_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || `AI Service error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Update learning progress in database.
 * Returns updated user + fresh JWT with new learningProgress.
 * @param {number} progress - Progress value (0-100)
 * @returns {Promise<{ message: string, data: { user: object, token: string } }>}
 */
export async function updateLearningProgress(progress) {
  return apiFetch('/auth/progress', {
    method: 'POST',
    body: JSON.stringify({ progress }),
  });
}

export { API_BASE_URL, AI_BASE_URL };
