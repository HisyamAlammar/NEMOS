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

## ⚡ BUG BARU (Wave 2 — Evaluasi Manual CTO)

- [ ] **[P1-NEW-04] — UI/State: Identitas Navbar & Dashboard UMKM Hardcoded**
  **Severity:** HIGH — Merusak ilusi platform multi-user.
  **Lokasi & Detail Scan:**
  | # | File | Line | Hardcoded Text | Konteks |
  |---|------|------|----------------|---------|
  | 1 | `App.jsx` | 56 | `Budi Santoso` | InvestorTopNav — desktop name |
  | 2 | `App.jsx` | 100 | `Budi Santoso` | InvestorTopNav — mobile dropdown |
  | 3 | `App.jsx` | 219 | `Ibu Sari` | UmkmSidebar — alt text |
  | 4 | `App.jsx` | 225 | `Ibu Sari` | UmkmSidebar — name display |
  | 5 | `Dashboard.jsx` | 18 | `Budi Santoso` | "Selamat datang, Budi Santoso" |
  | 6 | `UmkmDashboard.jsx` | 103 | `Ibu Sari` | Welcome avatar alt |
  | 7 | `UmkmDashboard.jsx` | 109 | `Bu Sari` | "Selamat datang, Bu Sari" |
  | 8 | `UmkmArena.jsx` | 272 | `Budi Santoso` | "Status AI: Konservatif — Budi Santoso" |
  | 9 | `Landing.jsx` | 114 | `Budi Santoso` | Testimonial display |
  | 10 | `Impact.jsx` | 191 | `@BudiSantoso` | Social handle display |
  **Solusi Arsitektur:**
  - Import `useAuthStore` di setiap komponen yang menampilkan identitas
  - Ganti semua literal nama dengan `user?.name` dari Zustand state
  - Navbar avatar initial: `user?.name?.charAt(0)?.toUpperCase()`
  - Fallback: `'User'` jika belum login
  **Auth Store Status:** Zustand store (`stores/auth.store.js`) sudah lengkap dengan `user.name`, `user.role`, `user.tier` — tinggal dipakai.

---

- [ ] **[P1-NEW-05] — Database: Data Dummy User Belum Ada (seed.ts)**
  **Severity:** HIGH — Tanpa seed, semua integrasi API tidak bisa didemo.
  **Lokasi:** `backend/prisma/seed.ts` (BELUM ADA)
  **Prisma Schema Reference:**
  - `User`: id, email, password, name, role, tier, riskProfile, learningProgress
  - `UMKM`: id, name, location, category, grade, target, current, rbfRate, description, imageUrl, ownerId
  - `Investment`: id, amount, userId, umkmId, xenditTxId, merkleLeaf, status
  **Yang Harus Dibuat:**
  1. User Investor: `{ name: 'Budi Santoso', email: 'budi@nemos.id', role: 'INVESTOR', tier: 'PREMIUM', learningProgress: 100 }`
  2. User UMKM: `{ name: 'Bu Sari', email: 'sari@nemos.id', role: 'UMKM_OWNER' }`
  3. UMKM record: `{ name: 'Dapur Nusantara', location: 'Bandung, Jawa Barat', category: 'Kuliner', grade: 'A', target: 50_000_000, ... }`
  4. Opsional: 1-2 Investment record untuk demo Dashboard
  5. Password harus di-hash dengan bcrypt
  6. Update `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`
  **Catatan:** DILARANG mengubah `schema.prisma`. Seed HARUS cocok 100% dengan skema yang ada.

---

## Ringkasan
- Total P1 bugs (Wave 1): **4** — semua ✅ FIXED
- Total P1 bugs (Wave 2): **2** — menunggu eksekusi
- **TOTAL SISA: 2**

## Bug Lama dari Audit Sebelumnya yang Sudah Fixed (Sprint 5):
- H-01 ✅ `RELAYER_PRIVATE_KEY` & `POLYGON_AMOY_RPC` sudah di requiredEnvVars
- H-03 ✅ Gas estimation sudah diimplementasikan (5-step Rule 7)
- H-04 ✅ Redlock distributed lock sudah ada di merkle.worker.ts
- C-02 ✅ Blockchain POST endpoints sudah dilindungi authMiddleware + adminGuard
