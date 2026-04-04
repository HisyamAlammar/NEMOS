# SPRINT 6: DEMO PREPARATION & SCENARIO DOCUMENTATION

Dokumen ini merinci rencana audit teknis dan skenario modifikasi (_bypassing_) untuk persiapan Demo Presentasi NEMOS. Karena lingkungan demo tidak selalu dapat bergantung pada *real-time webhooks* (seperti payment gateway), beberapa komponen sistem akan dimodifikasi agar dapat berjalan secara instan dan lancar saat demonstrasi, tanpa merusak arsitektur data.

**PERINGATAN PROTOKOL:** Dokumen ini HANYA memuat blueprint rencana eksekusi. **Kode yang ada di production/repository belum diubah.**

---

## 1. Hapus UI Toggle Role (RoleSwitcher)

**Masalah:** Saat ini terdapat tombol melayang (_floating switcher_) di sudut kanan bawah aplikasi yang memungkinkan perpindahan tampilan antara Investor dan Pengusaha UMKM secara instan untuk keperluan UI testing. Untuk demo, ini akan membingungkan juri/audiens.

**Rencana Eksekusi:**
- **File Target:** `src/App.jsx`
- **Tindakan:**
  - Menghapus komponen `RoleSwitcher` (sekitar baris 293-305).
  - Menghapus pemanggilan `<RoleSwitcher userRole={userRole} />` di dalam komponen utama `App`.
  - Sistem akan sepenuhnya mengandalkan autentikasi (Zustand `authStore`) untuk penentuan routing (bukan dari toggle UI).

## 2. Instant Premium (Xendit Bypass)

**Masalah:** Pada sistem asli, proses _Upgrade Tier_ memanggil Xendit untuk men-generate QRIS, dan status _Premium_ baru aktif setelah webhook merespons. Di dalam demo, kita ingin flow yang lebih instan namun tetap memperlihatkan modal UI yang solid.

**Rencana Eksekusi:**
- **File Target (Backend):** `backend/src/routes/auth.routes.ts`
  - Memodifikasi endpoint `POST /api/auth/upgrade-tier`.
  - Melewati pembuatan QRIS via Xendit.
  - Langsung jalankan `prisma.user.update({ tier: 'PREMIUM' })`.
  - Mengabaikan pembuatan _Transaction_ (_PENDING_) dan Webhook.
  - Endpoint mengembalikan status sukses beserta token JWT baru yang mencatat `tier: "PREMIUM"`.
- **File Target (Frontend):** `src/components/UpgradeModal.jsx`
  - Apabila _user_ belum _login_, _button_ tidak memanggil API tapi akan memicu notifikasi peringatan (toast) lalu me-redirect ke halaman `/login`.
  - Jika _user_ sudah _login_, memanggil API untuk upgrade instan, lalu men-delay animasi `CONFIRMED` sedetik untuk pengalaman UX yang _smooth_.

## 3. Database Seeding (Dummy UMKM)

**Masalah:** Database kosong akan membuat aplikasi tampak tidak menarik. Kita butuh minimal 5 profil UMKM (Grade A, B, C) untuk memenuhi `UmkmArena` dan memamerkan fitur _Investment Gate_ NEMOS.

**Rencana Eksekusi:**
- **File Target:** `backend/prisma/seed.ts`
  - Membuat _script seed_ Prisma.
  - **Skenario Data:**
    - Membuat 5 _User_ dengan _role_ `UMKM_OWNER`.
    - Membuat 5 data _UMKM_ yang dihubungkan kepada para _User_ tersebut.
    - Pembagian Risiko: 2 UMKM Grade A, 2 UMKM Grade B, dan 1 UMKM Grade C.
    - Pastikan penamaan ID sinkron (atau cukup _auto-generate uuid_ tapi _seeded_) sehingga halaman _Arena_ merender data API tanpa _error_.
    - Eksekusi dapat dipanggil via terminal: `npx prisma db seed`.

## 4. Integrasi Progress Belajar (LearnHub)

**Masalah:** Memastikan integrasi progress tersimpan ke Database agar _Investment Gate_ benar-benar mengunci akses UMKM jika nilai _learningProgress_ belum mencapai limit.

**Rencana Eksekusi (Verifikasi UAT):**
- Hal ini sebagian besar sudah terselesaikan di Batch 5.
- _Flow Validasi_:
  - **Backend:** `PATCH /api/auth/me/progress` memvalidasi angka `0 - 100` (hanya bisa naik, tidak bisa turun), lalu menyimpan nilainya di tabel `User`. Token JWT baru dengan nilai ter-update juga di-return.
  - **Frontend:** Di `src/pages/LearnHub.jsx`, setiap kali tombol "Selesaikan Modul" diklik, _progress_ akan dikalkulasi (misal `14%` per modul), dan API `PATCH` dipanggil. `auth_store` akan langsung merefleksikan nilai tersebut.
- *Status untuk DemoPrep:* Skema ini sudah di-_wiring_ dengan baik dan siap untuk sesi presentasi.

## 5. Login Routing Fix

**Masalah:** Secara historis dan _default_, setelah proses _Login_, semua investor diarahkan ke `/dashboard`. Namun, untuk alur demo, arah navigasi terbaik setelah masuk bagi `INVESTOR` adalah menuju `/arena` untuk langsung melihat UMKM.

**Rencana Eksekusi:**
- **File Target:** `src/pages/Login.jsx`
- **Tindakan:** Mengubah kondisi `navigate()` di block `handleLogin`:
  - Jika _role_ sama dengan `UMKM_OWNER` → `navigate('/umkm-dashboard')` (tetap).
  - Jika _role_ sama dengan `INVESTOR` → `navigate('/arena')` (diubah dari yang sebelumnya `/dashboard`).

## 6. Skenario "Simulasi Pembayaran" (Krusial)

**Masalah:** Di demo investasi (`PaymentModal.jsx`), *User* (Investor) diperlihatkan QRIS Xendit. Waktu presentasi yang ketat membuat kita tidak bisa diam-diam memindai QRIS (atau menembak webhook Xendit via Postman) tanpa merusak _flow_ kamera/presenter.

**Rencana Eksekusi:**
- **File Target (Backend):** `backend/src/routes/invest.routes.ts`
  - Menambahkan _endpoint_ _mock_: `POST /api/invest/:investmentId/simulate-payment`
  - Fungsinya mencari data `Investment` di database, mengubah statusnya menjadi `ACTIVE`, dan mencari transaksi berelasi (`PENDING`) lalu mengubah statusnya menjadi `CONFIRMED`.
  - Secara opsional, otomatis membuat `Tranche 1` agar dana langsung tercatat masuk ke sisi UMKM.
- **File Target (Frontend):** `src/components/PaymentModal.jsx`
  - Menyisipkan tombol khusus berwarna sekunder/transparan (Contoh: "Simulasi Bayar Berhasil (Demo)") di bawah blok QRIS atau pada footer Modal.
  - Jika di-klik, `fetch` ke _endpoint_ simulasi di atas, lalu paksa _state_ UI menjadi `SUCCESS`.
  - Memastikan halaman lain me-render perubahan dari status yang *ACTIVE* ini.

---
**Status Audit & Rencana:** Blueprint sudah diverifikasi (Selesai). Menunggu persetujuan eksekusi dan integrasi final pada masing-masing _file codebase_.
