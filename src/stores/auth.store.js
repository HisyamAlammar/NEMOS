/**
 * stores/auth.store.js — Zustand Auth Store
 *
 * Global authentication state management.
 * Persists to localStorage so login survives page refresh.
 *
 * Usage:
 *   import { useAuthStore } from '../stores/auth.store';
 *
 *   // In component:
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser, getMe } from '../lib/auth.api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── STATE ───────────────────────────────────────────
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // ── COMPUTED ────────────────────────────────────────
      get isAuthenticated() {
        return !!get().token;
      },

      get canInvest() {
        const user = get().user;
        return user?.role === 'INVESTOR' && user?.learningProgress >= 100;
      },

      get learningProgress() {
        return get().user?.learningProgress || 0;
      },

      // ── ACTIONS ─────────────────────────────────────────

      /**
       * Register new user.
       */
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(data);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      /**
       * Login with email + password.
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(credentials);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      /**
       * Refresh user data from server.
       */
      refreshUser: async () => {
        try {
          const response = await getMe();
          set({ user: response.data });
        } catch {
          // Token invalid — force logout
          get().logout();
        }
      },

      /**
       * Update learning progress locally (optimistic).
       * Called when user completes a module in the Learn Hub.
       */
      updateLearningProgress: (progress) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, learningProgress: progress } });
        }
      },

      /**
       * Logout — clear all state.
       */
      logout: () => {
        set({ user: null, token: null, error: null });
      },

      /**
       * Clear error state.
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'nemos-auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        user: state.user,
        token: state.token,
      }),
    }
  )
);
