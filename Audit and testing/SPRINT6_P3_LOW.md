# SPRINT 6 — P3 LOW SEVERITY BUGS

---

- [ ] **[L-01] — UI: Missing `autocomplete` Attributes**
  **Deskripsi:** Input email dan password di `Login.jsx` tidak memiliki atribut `autocomplete="email"` / `autocomplete="current-password"`.
  **Dampak:** Browser password manager tidak bisa menyarankan credential yang tersimpan secara akurat.
  **File Terdampak:** `src/pages/Login.jsx` (baris 133, 139)
  **Status Audit Sebelumnya:** Konfirmasi bug lama L-01 — MASIH ADA

---

- [ ] **[L-03] — UI: Floating Role Toggle Overlap di Arena dan Dashboard**
  **Deskripsi:** Toggle "Investor / Pengusaha UMKM" di bagian bawah layar menutupi konten (tombol "Lihat Detail" di Arena, section "Sedang Dipelajari" di Dashboard) pada viewport tertentu.
  **Dampak:** UX terganggu — user harus scroll ekstra untuk klik tombol yang tertutup.
  **File Terdampak:** `src/pages/UmkmArena.jsx`, `src/pages/Dashboard.jsx`
  **Status Audit Sebelumnya:** Konfirmasi bug lama L-03 — MASIH ADA

---

- [ ] **[L-02] — UI: Console Warning Password Field Not in Form**
  **Deskripsi:** Di `Register.jsx`, password field mungkin tidak dibungkus `<form>` tag yang proper, menyebabkan warning DOM di console.
  **Dampak:** Cosmetic — tidak ada fungsionalitas yang rusak.
  **File Terdampak:** `src/pages/Register.jsx`
  **Status Audit Sebelumnya:** Konfirmasi bug lama L-02 — BELUM DIVERIFIKASI (backend mati, tidak bisa test penuh)

---

## Ringkasan
- Total bug baru ditemukan: **0**
- Konfirmasi bug lama masih ada: **3** (L-01, L-02, L-03)
- Bug lama yang sudah diperbaiki: **0**
