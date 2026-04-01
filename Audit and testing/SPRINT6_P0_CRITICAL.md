# SPRINT 6 — P0 CRITICAL BUGS

---

- [x] **[P0-NEW-01] — Backend: Server CRASH on Startup — `redlock` Module Not Installed** → ✅ FIXED
  **Fix:** `npm install` di folder `backend/` — modul redlock ter-install dari package.json.
  **Verifikasi:** Server start sukses, semua service (PostgreSQL, Redis, BullMQ, Cron) connected.

---

- [x] **[C-01] — Auth: Login.jsx Bypass — Masuk Tanpa Password** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** File `Login.jsx` di branch saat ini sudah correct: `useAuthStore.login()` dipanggil, controlled inputs, error handling lengkap.
  **Verifikasi:** Backend returns `401 LOGIN_FAILED` untuk credential salah. UI menampilkan error saat field kosong.

---

- [x] **[C-01b] — Auth: Login.jsx Password Hardcoded di defaultValue** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** Input menggunakan `value={email}` / `value={password}` (controlled), `placeholder` text (bukan `defaultValue`).

---

## Ringkasan FINAL
- Total P0 bugs: **3**
- Fixed sekarang: **1** (P0-NEW-01)
- Sudah fixed sebelumnya (konfirmasi): **2** (C-01, C-01b)
- Sisa: **0**
