# SPRINT 6 — P2 MEDIUM: EDGE CASES — POST-REMEDIATION

> **Audit Date:** 2026-04-02 | **Remediation Date:** 2026-04-02
> **Status:** 3/7 FIXED (4 informational/deferred)

---

- [x] **[EDGE-P2-01] Amount Negatif** → ✅ AMAN (implicit validation by `< 100_000` check)

- [x] **[EDGE-P2-02] React Error Boundary** → ✅ FIXED
  **Fix:** Created `src/components/ErrorBoundary.jsx` (class component with `getDerivedStateFromError`). Wrapped `<App />` in `main.jsx` with `<ErrorBoundary>`. Fallback UI shows "Oops, Terjadi Kesalahan" with reload button.

- [ ] **[EDGE-P2-03] HEIC Support** → ℹ️ INFORMATIONAL (low risk for hackathon demo)

- [ ] **[EDGE-P2-04] Webhook Silent Error** → ℹ️ INTENTIONAL DESIGN (prevents Xendit retry storm)

- [ ] **[EDGE-P2-05] Client Max Amount** → ℹ️ INFORMATIONAL (backend validates via `EXCEEDS_TARGET`)

- [ ] **[EDGE-P2-06] Role Escalation** → ✅ AMAN saat ini (ADMIN not in register whitelist)

- [x] **[EDGE-P2-07] Error Message Exposure** → ✅ FIXED
  **Fix:** `app.ts` — Global error handler now checks `NODE_ENV !== "production"`. Production mode returns generic "Terjadi kesalahan internal"; dev mode shows `err.message`.
