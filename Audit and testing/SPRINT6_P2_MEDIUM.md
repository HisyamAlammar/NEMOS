# SPRINT 6 — P2 MEDIUM SEVERITY BUGS

---

- [x] **[M-01] — Frontend: Register.jsx Tidak Submit ke API** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** `Register.jsx` di branch saat ini sudah memiliki `useAuthStore.register()` (line 412),
  `handleSubmit` memanggil `await register(data)` (line 418), error handling lengkap, navigasi
  role-based (INVESTOR→/onboarding, UMKM_OWNER→/umkm-dashboard).
  **Verifikasi:** Vite build sukses, kode review konfirmasi wiring lengkap.

---

- [x] **[M-03] — Frontend: TX Hash Dummy + Link etherscan.io** → ✅ FIXED
  **Root Cause:** UmkmDetail.jsx line 199 menampilkan `TX: 0xA1b2...C3d4` (palsu) dan link
  ke `etherscan.io` (wrong chain — NEMOS pakai Polygon Amoy, bukan Ethereum).
  **Fix:** Diganti dengan:
  - Contract address real: `0x1aa24060c4Cc855b8437DBA3b592647C43c87012`
  - Display: `Contract: 0x1aa2...7012`
  - Link: `https://amoy.polygonscan.com/address/0x1aa24060c4Cc855b8437DBA3b592647C43c87012`
  - Label: "Lihat di Polygonscan"
  **Verifikasi:** Vite build sukses, link menuju Polygon Amoy Testnet explorer.

---

- [x] **[M-04] — Frontend: Data UMKM Hardcoded (UmkmArena + UmkmDetail)** → ✅ FIXED
  **Root Cause:** `UmkmArena.jsx` dan `UmkmDetail.jsx` menggunakan array/objek statis
  `umkmList` dan `UMKM_DATA` — tidak ada koneksi ke backend database.
  **Fix:**
  1. **Backend** — Created `GET /api/umkm` (list) dan `GET /api/umkm/:id` (detail) in
     `backend/src/routes/umkm.routes.ts`, mounted at `/api/umkm` in `app.ts`.
     - BigInt→Number serialization untuk JSON
     - Extracts `latestTxHash` dari confirmed transactions
     - Includes owner relation dan investor count
  2. **Frontend API** — Created `src/lib/umkm.api.js` with `fetchUmkmList()` and
     `fetchUmkmDetail(id)`, graceful error handling (returns null on failure).
  3. **UmkmArena.jsx** — Static data renamed to `DEMO_UMKM_LIST`, added `useEffect`
     fetch from API via `fetchUmkmList()`. When backend has data → uses real DB data;
     when empty → graceful fallback to demo data.
  4. **UmkmDetail.jsx** — Static data renamed to `DEMO_UMKM_DATA`, added `useEffect`
     fetch from API via `fetchUmkmDetail(id)`. Merges API data with demo enrichment
     fields (story, heroImg, alloc charts) for complete presentation.
  **Verifikasi:** `GET /api/umkm` returns `{ status: "ok", data: [], count: 0 }` (DB belum seeded).
  Frontend falls back ke demo data. Vite build sukses.

---

## File yang Dimodifikasi/Dibuat

| # | File | Aksi | Bug |
|---|------|------|-----|
| 1 | `backend/src/routes/umkm.routes.ts` | **NEW** | M-04 |
| 2 | `backend/src/app.ts` | MODIFY (mount route) | M-04 |
| 3 | `src/lib/umkm.api.js` | **NEW** | M-04 |
| 4 | `src/pages/UmkmArena.jsx` | MODIFY (API fetch) | M-04 |
| 5 | `src/pages/UmkmDetail.jsx` | MODIFY (API fetch + TX fix) | M-03, M-04 |

## Ringkasan FINAL
- Total P2 bugs: **3** (M-01, M-03, M-04)
- Fixed sekarang: **2** (M-03, M-04)
- Sudah fixed sebelumnya (konfirmasi): **1** (M-01)
- Sisa: **0**
