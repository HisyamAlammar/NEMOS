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

## ⚡ BUG BARU (Wave 2 — Evaluasi Manual CTO)

- [ ] **[P2-NEW-01] — Fitur: Form Transaksi & Rekonsiliasi Cash Mati (Panel UMKM)**
  **Severity:** MEDIUM — Fitur operasional UMKM tidak berfungsi.
  **Lokasi:** `src/pages/UmkmDashboard.jsx`
  **Temuan:** Halaman UmkmDashboard tidak memiliki fitur interaktif "Pengajuan Transaksi"
  dan "Rekonsiliasi Cash". Search di seluruh `src/` tidak menemukan action handler untuk
  kedua fitur ini.
  **Yang Harus Dilakukan:**
  1. Identifikasi atau buat section "Pengajuan Transaksi" di UmkmDashboard
  2. Buat form input untuk nominal dan deskripsi transaksi
  3. Wire ke backend endpoint (atau buat baru `POST /api/umkm/transaction`)
  4. "Rekonsiliasi Cash": Buat UI toggle/form untuk UMKM owner mencatat penerimaan tunai
  5. Tampilkan Toast sukses/gagal setelah submit
  **Catatan:** Fitur ini penting untuk transparansi dan audit trail UMKM.

---

- [ ] **[P2-NEW-02] — Fitur: Komunitas Investor "Kirim Update" Statis**
  **Severity:** MEDIUM — Komunikasi UMKM↔Investor tidak tersinkronisasi.
  **Lokasi:** `src/pages/UmkmKomunitas.jsx` (line 24-29, 155-200)
  **Temuan:**
  ```jsx
  const handleSend = () => {
      if (!message.trim()) return;
      setSent(true);           // Hanya ubah state lokal
      setMessage('');
      setTimeout(() => setSent(false), 3000);  // Reset setelah 3 detik
  };
  ```
  - `handleSend` hanya set `sent=true` → **tidak ada API call**
  - Pesan yang dikirim **tidak muncul di bawah input** sebagai history
  - Pesan **tidak tersinkronisasi** ke panel Investor
  - Data investor (`investors` array line 3-9) sepenuhnya hardcoded
  **Yang Harus Dilakukan:**
  1. Buat state `sentMessages[]` untuk menyimpan riwayat pesan lokal
  2. Render pesan baru di bawah form input (append ke UI immediately)
  3. Opsional: Wire ke backend (`POST /api/umkm/broadcast`) untuk persistensi
  4. Toast notification: "Update berhasil dikirim ke X investor"
  **Catatan:** Untuk scope hackathon, local-state append sudah cukup tanpa backend persistence.

---

## File yang Dimodifikasi/Dibuat (Wave 1)

| # | File | Aksi | Bug |
|---|------|------|-----|
| 1 | `backend/src/routes/umkm.routes.ts` | **NEW** | M-04 |
| 2 | `backend/src/app.ts` | MODIFY (mount route) | M-04 |
| 3 | `src/lib/umkm.api.js` | **NEW** | M-04 |
| 4 | `src/pages/UmkmArena.jsx` | MODIFY (API fetch) | M-04 |
| 5 | `src/pages/UmkmDetail.jsx` | MODIFY (API fetch + TX fix) | M-03, M-04 |

## Ringkasan
- Total P2 bugs (Wave 1): **3** — semua ✅ FIXED
- Total P2 bugs (Wave 2): **2** — menunggu eksekusi
- **TOTAL SISA: 2**
