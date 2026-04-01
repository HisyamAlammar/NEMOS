# SPRINT 6 — P2 MEDIUM: EDGE CASES & ERROR HANDLING FINDINGS

> **Audit Mode:** READ-ONLY & EXPLOITATION
> **Auditor Role:** Principal Penetration Tester
> **Date:** 2026-04-02

---

## Active Vulnerabilities

- [ ] **[EDGE-P2-01] [Invest] Amount Negatif Lolos Validasi Backend**
  **Lokasi:** `invest.routes.ts:41` — Validasi hanya memeriksa `amountNum < 100_000`. Amount negatif (`-500000`) akan lolos check `isNaN` dan `< 100_000`... TAPI akan ditolak oleh check ini. Sebenarnya validasi `< 100_000` menangkap negatif karena -500000 < 100000 = true. **AMAN.**
  **NAMUN:** Amount `0` juga ditolak (0 < 100000). **Edge case aman.** Validasi implisit tapi benar.
  **Status:** ✅ AMAN (tapi perlu explicit `amountNum <= 0` check untuk kejelasan kode).

---

- [ ] **[EDGE-P2-02] [Frontend] Tidak Ada React Error Boundary — Crash = Layar Putih**
  **Lokasi:** Seluruh `src/` — Tidak ditemukan satupun komponen `ErrorBoundary` atau `componentDidCatch`.
  **Eksploitasi:** Jika API mengembalikan data format tak terduga (misal `fundedPercent: undefined` pada UMKM) → `undefined.toLocaleString()` → **unhandled runtime error** → seluruh React tree crash → **layar putih** tanpa pesan error → user bingung.
  **Dampak:** MEDIUM — Poor user experience, zero graceful degradation.
  **Cara Reproduksi:** Masuk ke UmkmDetail dengan ID yang tidak ada di fallback data → property access pada `undefined` → white screen.
  **Rekomendasi:** Buat komponen `ErrorBoundary` di level App yang menampilkan pesan "Oops, terjadi kesalahan" dengan tombol "Muat Ulang".

---

- [ ] **[EDGE-P2-03] [AI Service] OCR Endpoint Menerima File HEIC Tapi Mistral Mungkin Tidak Support**
  **Lokasi:** `routers/ocr.py:17` — `ALLOWED_TYPES` memuat `"image/heic"`. Namun NVIDIA NIM Mistral Vision belum pasti mendukung format HEIC.
  **Dampak:** Upload HEIC dari iPhone → dikirim ke Mistral → bisa crash, return random output, atau error 400 dari NVIDIA.
  **Cara Reproduksi:** Upload file `.heic` dari iPhone → lihat apakah Mistral mengembalikan JSON valid atau error.
  **Rekomendasi:** Konversi HEIC ke JPEG di server sebelum kirim ke AI, atau hapus dari ALLOWED_TYPES.

---

- [ ] **[EDGE-P2-04] [Webhook] Error Catch-All Mengembalikan 200 — Silent Failure**
  **Lokasi:** `webhook.routes.ts:103-107` — Catch block mengembalikan `status: 200` bahkan saat terjadi exception internal.
  **Analisis:** Ini INTENTIONAL — Xendit akan retry webhook jika menerima non-2xx. Mengembalikan 200 pada error mencegah infinite retry loop. **Desain ini valid untuk webhook handlers.**
  **NAMUN:** Error hanya di-log ke console (`console.error`). Tidak ada alerting, monitoring, atau persisted error log. Error bisa hilang begitu saja tanpa notifikasi.
  **Dampak:** MEDIUM — Payment yang gagal diproses bisa tidak terdeteksi selama berhari-hari.
  **Rekomendasi:** Tambahkan error ke dead-letter queue atau Sentry alerting.

---

- [ ] **[EDGE-P2-05] [Frontend] Investment Amount Input Tidak Memvalidasi Maximum**
  **Lokasi:** `UmkmDetail.jsx` — Input investasi hanya memeriksa minimum (`>= 100.000` di backend), tapi frontend tidak memberikan feedback jika amount melebihi sisa funding target.
  **Dampak:** User bisa memasukkan Rp 999.999.999.999 → backend menolak dengan `EXCEEDS_TARGET` → tapi error message mungkin tidak user-friendly.
  **Rekomendasi:** Tambahkan client-side validation max amount = sisa target.

---

- [ ] **[EDGE-P2-06] [Auth] Register Endpoint Menerima Role "INVESTOR" dari Client — Role Escalation Path**
  **Lokasi:** `auth.routes.ts:28` — Role hanya divalidasi sebagai salah satu dari `["INVESTOR", "UMKM_OWNER"]`. Tapi role `"ADMIN"` yang digunakan di `adminGuard` (`blockchain.routes.ts:33`) TIDAK bisa di-register via endpoint ini (karena tidak ada `"ADMIN"` di array validasi). **AMAN.**
  **NAMUN:** Jika developer menambahkan `"ADMIN"` ke array validasi di masa depan tanpa proteksi tambahan, siapapun bisa register sebagai ADMIN dan mengakses blockchain write endpoints.
  **Status:** ✅ AMAN saat ini, tapi berisiko di masa depan. Perlu komentar "[SECURITY NOTE]".

---

- [ ] **[EDGE-P2-07] [Frontend] Global Error Handler Backend Meng-expose `err.message` ke Client**
  **Lokasi:** `app.ts:66-68` — Handler mengirim `err.message` ke response JSON. Di production, ini bisa meng-expose detail internal (stack trace, query error, dll).
  **Dampak:** Information disclosure — penyerang bisa mendapatkan detail implementasi internal dari error messages.
  **Rekomendasi:** Di production, ganti `err.message` dengan generic message "Terjadi kesalahan internal".

---

## Previously Fixed — Verified

- [x] **[M-01] Register.jsx API** → ✅ Zustand wired
- [x] **[M-03] TX Hash dummy** → ✅ Real Polygonscan link
- [x] **[M-04] Data UMKM Hardcoded** → ✅ API fetch + fallback
- [x] **[P2-NEW-01] Cash Recon Dead** → ✅ Controlled forms + Toast
- [x] **[P2-NEW-02] Kirim Update Static** → ✅ Live append + Toast
