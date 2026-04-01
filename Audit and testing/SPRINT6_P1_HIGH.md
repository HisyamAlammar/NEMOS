# SPRINT 6 — P1 HIGH SEVERITY BUGS

---

- [x] **[H-02-PARTIAL] — Payment: XENDIT_WEBHOOK_TOKEN Tidak di Required Env Vars** → ✅ FIXED
  **Fix:** Ditambahkan ke `requiredEnvVars` array di `env.ts`, export diubah ke `!` assertion.
  **Verifikasi:** Server restart sukses (token ada di `.env`). Rule 8 compliant.

---

- [x] **[H-NEW-01] — Backend: Return Type Mismatch Warning** → ✅ VERIFIED (no change needed)
  **Status:** Kedua file sudah kompatibel (`string` return type). Peringatan cross-branch, bukan bug aktif.

---

- [x] **[H-NEW-02] — Backend: `rawPayload` Field Missing dari Prisma Schema** → ✅ FIXED
  **Fix:** `rawPayload` dihapus dari 4 file:
  - `invest.routes.ts` (Transaction create)
  - `payment.worker.ts` (interface + upsert create/update)
  - `queue.service.ts` (PaymentJobData interface)
  - `webhook.routes.ts` (enqueuePaymentJob call)
  **Verifikasi:** `grep rawPayload` = 0 results. Server restart sukses.

---

- [x] **[H-NEW-03] — Auth: `riskProfile` Field Missing dari Prisma Schema** → ✅ FIXED
  **Fix:** `riskProfile` dihapus dari 3 lokasi di `auth.service.ts` (registerUser select, loginUser return, getCurrentUser select).
  **Verifikasi:** `POST /api/auth/register` → 201 berhasil. `POST /api/auth/login` → 200 berhasil. Response tanpa `riskProfile`.

---

## Ringkasan FINAL
- Total P1 bugs: **4**
- Fixed sekarang: **3** (H-02-PARTIAL, H-NEW-02, H-NEW-03)
- Verified (no change): **1** (H-NEW-01)
- Sisa: **0**

## Bug Lama dari Audit Sebelumnya yang Sudah Fixed (Sprint 5):
- H-01 ✅ `RELAYER_PRIVATE_KEY` & `POLYGON_AMOY_RPC` sudah di requiredEnvVars
- H-03 ✅ Gas estimation sudah diimplementasikan (5-step Rule 7)
- H-04 ✅ Redlock distributed lock sudah ada di merkle.worker.ts
- C-02 ✅ Blockchain POST endpoints sudah dilindungi authMiddleware + adminGuard
