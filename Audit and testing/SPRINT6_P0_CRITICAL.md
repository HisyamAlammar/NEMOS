# SPRINT 6 — P0 CRITICAL: SECURITY & PENETRATION TEST FINDINGS

> **Audit Mode:** READ-ONLY & EXPLOITATION
> **Auditor Role:** Lead DevSecOps / Principal Penetration Tester
> **Date:** 2026-04-02

---

## Active Vulnerabilities

- [ ] **[SEC-P0-01] [Auth] JWT Payload Tidak Memuat Tier — Client-Side State Spoofing**
  **Eksploitasi:** JWT token yang di-generate (`auth.service.ts:86`) hanya memuat `{ userId, email, role }`. Field `tier` dan `learningProgress` TIDAK ada di JWT. Akibatnya, `POST /api/auth/upgrade-tier` men-cek tier dari DB (aman), TAPI frontend Zustand store (`auth.store.js:97-101`) memiliki `updateLearningProgress()` yang bisa dimanipulasi via DevTools:
  ```js
  // Di browser console:
  useAuthStore.setState({ user: { ...useAuthStore.getState().user, learningProgress: 100, tier: 'PREMIUM' } })
  ```
  **Dampak:** Pengguna bisa *bypass* UI lockout Grade A/B tanpa upgrade. **NAMUN**, `investmentGateMiddleware` (`investmentGate.ts:43`) mem-fetch `learningProgress` dari DATABASE, bukan dari JWT/client. Artinya backend tetap aman, tapi **UI menampilkan akses palsu** (user melihat tombol "Konfirmasi Pendanaan" terbuka padahal API akan menolak).
  **Severity:** MEDIUM-HIGH (UX deception, bukan data breach). Backend investment gate adalah **last line of defense yang berhasil**.
  **Cara Reproduksi:** Login sebagai Free Tier → Buka DevTools → Console → Jalankan script di atas → Navigasi ke UmkmArena → Card Grade A/B terlihat unlocked.

---

- [ ] **[SEC-P0-02] [Auth] Upgrade Tier Gratis Tanpa Payment Verification**
  **Eksploitasi:** Endpoint `POST /api/auth/upgrade-tier` (`auth.routes.ts:123`) langsung mengubah `tier` ke `PREMIUM` tanpa validasi pembayaran apapun. Setiap user yang terautentikasi bisa mengirim request sederhana:
  ```bash
  curl -X POST http://localhost:4000/api/auth/upgrade-tier \
    -H "Authorization: Bearer <any_valid_jwt>"
  ```
  **Dampak:** CRITICAL — Semua pengguna Free bisa upgrade ke Premium secara gratis, mem-bypass seluruh monetisasi platform.
  **Cara Reproduksi:** Login → Copy JWT token dari localStorage → Kirim POST request di atas → Tier berubah ke PREMIUM tanpa bayar.
  **Catatan:** Endpoint ini sengaja dibuat tanpa payment untuk hackathon demo. Untuk produksi, WAJIB dihubungkan ke flow Xendit sebenarnya.

---

- [ ] **[SEC-P0-03] [API] Zero Rate Limiting di Seluruh Endpoint**
  **Eksploitasi:** Tidak ada `express-rate-limit`, `helmet`, atau middleware proteksi brute-force apapun di `app.ts`. Seluruh endpoint terbuka untuk:
  1. **Brute-force login:** `POST /api/auth/login` bisa di-spam ribuan kali per detik tanpa lockout.
  2. **Invoice flooding:** `POST /api/invest` bisa di-spam untuk membuat ribuan invoice Xendit QRIS (DDoS pada payment gateway + DB pollution).
  3. **Webhook amplification:** `POST /api/webhooks/xendit` bisa di-spam dari source manapun.
  **Dampak:** CRITICAL — Brute-force credential attack, Xendit API quota exhaustion, database overflow.
  **Cara Reproduksi:** `for i in {1..1000}; do curl -s -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"x","password":"y"}'; done`

---

- [ ] **[SEC-P0-04] [Webhook] AdminGuard Menggunakan String Comparison Tanpa Timing-Safe**
  **Eksploitasi:** Di `blockchain.routes.ts:54`, `adminGuard` membandingkan `internalSecret === expectedSecret` menggunakan operator `===` standar JavaScript. Ini **rentan timing attack** — penyerang bisa mengukur waktu respons untuk menebak secret byte-per-byte. Bandingkan dengan `xendit.service.ts:116` yang sudah menggunakan `crypto.timingSafeEqual()` dengan benar.
  **Dampak:** HIGH — Secret `ADMIN_INTERNAL_SECRET` bisa di-leak secara perlahan via timing side-channel.
  **Cara Reproduksi:** Kirim ratusan request dengan variasi prefix secret yang berbeda → Ukur response time → Byte yang cocok akan memberikan respons sedikit lebih lambat.

---

- [ ] **[SEC-P0-05] [Auth] Tidak Ada Email Format Validation di Backend**
  **Eksploitasi:** `POST /api/auth/register` (`auth.routes.ts:20`) hanya memeriksa `!email` (truthy check). Tidak ada regex atau library validasi email. User bisa mendaftar dengan email invalid:
  ```bash
  curl -X POST http://localhost:4000/api/auth/register \
    -H 'Content-Type: application/json' \
    -d '{"email":"not-an-email","password":"12345678","name":"Hacker","role":"INVESTOR"}'
  ```
  **Dampak:** MEDIUM — Database polusi, impossible email recovery, juga bisa digunakan untuk membuat user tak terlacak.
  **Cara Reproduksi:** Kirim request di atas → Status 201 (berhasil).

---

## Previously Fixed (Sprint 6 Wave 1+2) — Verified Secure

- [x] **[C-01] Login Bypass** → ✅ Controlled inputs + API call
- [x] **[P0-NEW-01] Server Crash (redlock)** → ✅ Installed
- [x] **[P0-NEW-02] Konfirmasi Pendanaan Dead** → ✅ Wired to Xendit
- [x] **[P0-NEW-03] Upgrade Tier UI** → ✅ UpgradeModal (tapi perlu payment gate — lihat SEC-P0-02)
