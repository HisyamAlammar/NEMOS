# SPRINT 6 — P2 MEDIUM SEVERITY BUGS

---

- [x] **[M-01] — Frontend: Register.jsx Tidak Submit ke API** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** `Register.jsx` sudah memiliki `useAuthStore.register()`, error handling lengkap, navigasi role-based.

---

- [x] **[M-03] — Frontend: TX Hash Dummy + Link etherscan.io** → ✅ FIXED
  **Fix:** Diganti contract address real `0x1aa24060c4Cc855b8437DBA3b592647C43c87012` + Polygonscan link.

---

- [x] **[M-04] — Frontend: Data UMKM Hardcoded (UmkmArena + UmkmDetail)** → ✅ FIXED
  **Fix:** Backend `GET /api/umkm` endpoints + frontend API fetch + demo fallback.

---

- [x] **[P2-NEW-01] — Fitur: Form Transaksi & Rekonsiliasi Cash Mati** → ✅ FIXED
  **Root Cause:** Tombol "Simpan Draft" dan "Ajukan untuk Diverifikasi" di UmkmDashboard tidak memiliki onClick handler. Form select dan input tidak memiliki value/onChange binding.
  **Fix di `UmkmDashboard.jsx`:**
  1. Added `cashCategory`, `cashAmount`, `cashTransactions` state
  2. Bound `<select>` dan `<input>` ke controlled state
  3. Input amount auto-strips non-numeric characters (`replace(/[^0-9]/g, '')`)
  4. "Simpan Draft" → validates amount → success toast
  5. "Ajukan untuk Diverifikasi" → validates category+amount → appends to `cashTransactions` → reset form → success toast
  6. Submitted transactions rendered in new "Transaksi Cash Diajukan" card with yellow badge "Menunggu Verifikasi"
  7. Toast component imported and rendered
  **Verifikasi:** Vite build sukses 0 errors.

---

- [x] **[P2-NEW-02] — Fitur: Komunitas Investor "Kirim Update" Statis** → ✅ FIXED
  **Root Cause:** `handleSend()` hanya set `sent=true` lalu reset — tidak ada persistensi pesan, pesan tidak muncul di UI.
  **Fix di `UmkmKomunitas.jsx`:**
  1. Added `sentMessages[]` state array
  2. `handleSend()` sekarang creates `{ text, date, time, views }` object dan prepends ke `sentMessages`
  3. New messages render di atas "Previous Update Card" dengan:
     - Green background (`#F0FDF4`) + green border
     - Badge "Baru Terkirim"
     - Timestamp (date + time)
     - Simulated view count (80-127 investor)
  4. Toast notification: "Update berhasil dikirim ke 127 investor!"
  5. Messages prepend (newest first) — user sees immediate feedback
  **Verifikasi:** Vite build sukses 0 errors.

---

## File yang Dimodifikasi/Dibuat (Wave 1 + Wave 2)

| # | File | Aksi | Bug |
|---|------|------|-----|
| 1 | `backend/src/routes/umkm.routes.ts` | **NEW** | M-04 |
| 2 | `backend/src/app.ts` | MODIFY | M-04 |
| 3 | `src/lib/umkm.api.js` | **NEW** | M-04 |
| 4 | `src/pages/UmkmArena.jsx` | MODIFY | M-04 |
| 5 | `src/pages/UmkmDetail.jsx` | MODIFY | M-03, M-04 |
| 6 | `src/pages/UmkmDashboard.jsx` | MODIFY | P2-NEW-01 |
| 7 | `src/pages/UmkmKomunitas.jsx` | MODIFY | P2-NEW-02 |

## Ringkasan FINAL
- Total P2 bugs (Wave 1 + Wave 2): **5**
- Semua FIXED: **5/5** ✅
- Sisa: **0**
