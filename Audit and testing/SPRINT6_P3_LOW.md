# SPRINT 6 — P3 LOW SEVERITY BUGS

---

- [x] **[L-01] — Login.jsx: `autocomplete` Attributes Missing** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** Input email sudah memiliki `autoComplete="email"` (line 159).
  Input password sudah memiliki `autoComplete="current-password"` (line 165).
  **Verifikasi:** Code review konfirmasi.

---

- [x] **[L-02] — Register.jsx: Console Warning (Password tanpa `<form>`)** → ✅ SUDAH DIPERBAIKI SEBELUMNYA
  **Status:** Semua password input sudah wrapped di `<form>` tags:
  - `InvestorForm`: `<form onSubmit={...}>` (line 211-243)
  - `UmkmForm Step 1`: `<form onSubmit={...}>` (line 299-314)
  - `UmkmForm Step 3`: `<form onSubmit={...}>` (line 359-400)
  Semua memiliki `autoComplete="new-password"`.
  **Verifikasi:** Code review konfirmasi. Vite build 0 errors.

---

- [x] **[L-03] — Floating Role Toggle Menutupi Konten** → ✅ FIXED
  **Root Cause:** `RoleSwitcher` component (App.jsx line 293) menggunakan `position: fixed`
  di `bottom: 20, right: 20, zIndex: 1000`. Halaman Dashboard, UmkmArena, dan UmkmDashboard
  tidak memiliki cukup bottom padding sehingga tombol CTA di bagian bawah tertutup.
  **Fix:** CSS global di `index.css`:
  - `.view` → ditambahkan `padding-bottom: 80px`
  - `.main-content` → ditingkatkan dari `80px` ke `100px`
  **Verifikasi:** Vite build sukses. Padding 80px > overlap zone 64px (toggle bottom 20 + height 44).

---

## File yang Dimodifikasi

| # | File | Aksi | Bug |
|---|------|------|-----|
| 1 | `src/index.css` | MODIFY (padding-bottom) | L-03 |

## Ringkasan FINAL
- Total P3 bugs: **3** (L-01, L-02, L-03)
- Fixed sekarang: **1** (L-03)
- Sudah fixed sebelumnya (konfirmasi): **2** (L-01, L-02)
- Sisa: **0**
