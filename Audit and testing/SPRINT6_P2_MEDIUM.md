# SPRINT 6 — P2 MEDIUM SEVERITY BUGS

---

- [ ] **[M-01] — Frontend: Register.jsx Tidak Terhubung ke Backend API**
  **Deskripsi:** `Register.jsx` (508 baris) memiliki UI multi-step lengkap (Data Diri, Data Usaha, KYC), tapi **tidak ada** fungsi `handleSubmit`, `handleRegister`, atau `onSubmit` di seluruh file. Store `useAuthStore` diimport di baris 3 tapi tidak pernah dipanggil. Tombol "Buat Akun" tidak terhubung ke handler apapun.
  **Dampak:** User baru tidak bisa mendaftar. Registration flow 100% non-functional.
  **Langkah Reproduksi:**
    1. Buka `/register`
    2. Isi semua field
    3. Klik "Buat Akun"
    4. Cek Network tab → Expected: POST /api/auth/register | Actual: Tidak ada request
  **File Terdampak:** `src/pages/Register.jsx`
  **Status Audit Sebelumnya:** Konfirmasi bug lama M-01 — MASIH ADA

---

- [ ] **[M-03] — Frontend: TX Hash Palsu di UmkmDetail.jsx**
  **Deskripsi:** Halaman UMKM Detail menampilkan TX hash `0xA1b2...C3d4` yang merupakan placeholder hardcoded. Link "Lihat di blockchain explorer" mengarah ke `etherscan.io` bukan `amoy.polygonscan.com`. Untuk demo juri, ini sangat merusak kredibilitas karena klik link akan menunjukkan TX hash yang tidak ada.
  **Dampak:** Magic Moment 3 tidak bisa didemonstrasikan dengan benar — juri klik link dan mendapat 404 di Etherscan.
  **Langkah Reproduksi:**
    1. Buka `/detail/0`
    2. Lihat TX hash: `TX: 0xA1b2...C3d4`
    3. Klik "Lihat di blockchain explorer"
    4. Expected: Polygonscan Amoy | Actual: Etherscan (wrong network) + hash palsu
  **File Terdampak:** `src/pages/UmkmDetail.jsx`
  **Status Audit Sebelumnya:** Konfirmasi bug lama M-03 — MASIH ADA

---

- [ ] **[M-04] — Frontend: UmkmArena + UmkmDetail Data Hardcoded**
  **Deskripsi:** Seluruh data UMKM (nama, lokasi, grade, target, funding) di-hardcode langsung di JSX file sebagai static arrays/objects. Tidak ada API call ke backend `/api/umkm`. Ini berarti data tidak akan pernah berubah meskipun database di-update.
  **Dampak:** Jika juri menanyakan tentang data real-time, platform tidak bisa menunjukkan data yang berubah dinamis.
  **Langkah Reproduksi:**
    1. Buka `/arena` → data UMKM statis
    2. Cek Network tab → tidak ada request ke `/api/umkm`
  **File Terdampak:** `src/pages/UmkmArena.jsx`, `src/pages/UmkmDetail.jsx`
  **Status Audit Sebelumnya:** Konfirmasi bug lama M-04 — MASIH ADA

---

## Ringkasan
- Total bug baru ditemukan: **0**
- Konfirmasi bug lama masih ada: **3** (M-01, M-03, M-04)
- Bug lama yang sudah diperbaiki: **0**
