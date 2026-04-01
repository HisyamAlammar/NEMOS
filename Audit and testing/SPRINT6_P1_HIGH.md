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
  **Fix:** `riskProfile` dihapus dari 3 lokasi di `auth.service.ts`.
  **Verifikasi:** `POST /api/auth/register` → 201. `POST /api/auth/login` → 200.

---

- [x] **[P1-NEW-04] — UI/State: Identitas Navbar & Dashboard UMKM Hardcoded** → ✅ FIXED
  **Root Cause:** 8 string hardcoded "Budi Santoso" dan "Bu Sari/Ibu Sari" di 4 file.
  **Fix:** Import `useAuthStore` dan ganti semua literal nama dengan `user?.name`:
  | # | File | Lokasi | Before → After |
  |---|------|--------|----------------|
  | 1 | `App.jsx` | InvestorTopNav desktop | `"Budi Santoso"` → `{userName}` |
  | 2 | `App.jsx` | InvestorTopNav mobile | `"Budi Santoso"` → `{userName}` |
  | 3 | `App.jsx` | InvestorTopNav avatar | `"B"` → `{userInitial}` (x2) |
  | 4 | `App.jsx` | UmkmSidebar alt | `"Ibu Sari"` → `{ownerName}` |
  | 5 | `App.jsx` | UmkmSidebar name | `"Ibu Sari"` → `{ownerName}` |
  | 6 | `Dashboard.jsx` | Welcome title | `"Budi Santoso"` → `{userName}` |
  | 7 | `UmkmDashboard.jsx` | Avatar alt | `"Ibu Sari"` → `{ownerName}` |
  | 8 | `UmkmDashboard.jsx` | Welcome title | `"Bu Sari"` → `{ownerName}` |
  | 9 | `UmkmArena.jsx` | AI status pill | `"Budi Santoso"` → `{userName}` |
  **Remaining (acceptable):** `Register.jsx` placeholder, `Landing.jsx` testimonial — content, not identity.
  **Verifikasi:** `grep "Bu Sari\|Ibu Sari"` = 0 aktif identity refs. Vite build 0 errors.

---

- [x] **[P1-NEW-05] — Database: Data Dummy User Belum Ada (seed.ts)** → ✅ FIXED
  **Fix:** Created `backend/prisma/seed.ts` with:
  - Investor: Budi Santoso (`budi@nemos.id`, PREMIUM, learningProgress=100)
  - UMKM Owner: Bu Sari (`sari@nemos.id`, UMKM_OWNER)
  - UMKM: Dapur Nusantara (Grade A, target Rp 50M, current Rp 37.5M)
  - 2 Investments (Rp 25M + Rp 12.5M, ACTIVE)
  - 1 Transaction (CONFIRMED, with polygonTxHash)
  - Password hashed with bcrypt
  - Idempotent via upsert + existence checks
  **Config:** `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`
  **Verifikasi:** TS types valid. Schema.prisma NOT modified.

---

## Ringkasan FINAL
- Total P1 bugs (Wave 1 + Wave 2): **6**
- Semua FIXED: **6/6** ✅
- Sisa: **0**

## Bug Lama dari Audit Sebelumnya yang Sudah Fixed (Sprint 5):
- H-01 ✅ `RELAYER_PRIVATE_KEY` & `POLYGON_AMOY_RPC` sudah di requiredEnvVars
- H-03 ✅ Gas estimation sudah diimplementasikan (5-step Rule 7)
- H-04 ✅ Redlock distributed lock sudah ada di merkle.worker.ts
- C-02 ✅ Blockchain POST endpoints sudah dilindungi authMiddleware + adminGuard
