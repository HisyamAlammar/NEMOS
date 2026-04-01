# SPRINT 6 — P3 LOW
## Wizard of Oz Video UI + Minor Fixes & Demo Polish

**Branch:** `fix/sprint-6-hardening`
**Prioritas:** 🟢 LOW — Kerjakan hanya jika waktu memungkinkan sebelum demo
**Estimasi total:** ~85 menit
**Bug yang ditutup:** GEM-03, H-04, L-01, L-02, L-03

---

## PRASYARAT

Sebelum mengerjakan P3, konfirmasi bahwa P0, P1, dan P2 sudah selesai:
- [ ] Semua bug Critical dan High sudah ditutup
- [ ] Data UMKM sudah dinamis dari database
- [ ] Image hashing sudah berjalan di AI service
- [ ] Semua commit P0, P1, P2 sudah ada di branch

P3 adalah **demo polish** — tidak ada yang security-critical di sini.
Jika waktu sangat terbatas, prioritaskan GEM-03 (Wizard of Oz) karena
ini yang paling visible saat demo ke juri.

---

## ═══════════════════════════════════════
## TASK P3-A — Wizard of Oz Video Verification UI [Bug GEM-03]
## ═══════════════════════════════════════

**File:** `src/pages/UmkmDashboard.jsx`

### Konteks

Pemrosesan video asli dengan Gemini terlalu berat untuk MVP. Kita menggunakan
teknik "Wizard of Oz" — simulasi UI yang terlihat nyata tanpa backend logic.
Ini untuk "menjual" konsep keamanan multi-layer kepada juri.

**Target tampilan:** Juri melihat kamera menyala, melihat loading multi-tahap
yang terlihat canggih, lalu melihat hasil "terverifikasi". Kesan: sistem
benar-benar melakukan face scan dan analisis video.

### Yang Harus Diimplementasikan

**Langkah A1 — Tambah state untuk video verification flow:**
```javascript
useState untuk:
  - showVideoModal (false)
  - verificationStep (0)   // 0: idle, 1: analyzing face, 2: timestamp, 3: object match, 4: success
  - cameraStream (null)    // MediaStream dari getUserMedia
  - cameraError (null)     // Jika kamera tidak bisa diakses
```

**Langkah A2 — Tombol trigger:**

Tambahkan tombol ini di seksi yang tepat di UmkmDashboard
(misalnya di seksi pencairan dana / tranche):

```jsx
<button
  onClick={() => setShowVideoModal(true)}
  className="[gunakan styling yang sudah ada di codebase]"
>
  📹 Upload Video Unboxing & Wajah (Wajib untuk pencairan &gt; Rp 10 Juta)
</button>
```

**Langkah A3 — Modal Video Verification:**

Buat komponen modal dengan struktur ini:

```
Modal Container (overlay fullscreen dengan backdrop gelap):
  ├── Header: "Verifikasi Video Unboxing"
  ├── Camera Preview Area (kotak video hitam 480x320):
  │     └── <video> element dengan ref ke cameraStream
  ├── Status Area:
  │     ├── Step 0 (idle): "Siapkan wajah Anda di depan kamera..."
  │     ├── Step 1: "🔍 Menganalisis wajah pemilik UMKM..." + spinner
  │     ├── Step 2: "⏱️ Mengekstrak timestamp dan mencocokkan Proof of Delivery..." + spinner
  │     ├── Step 3: "📦 Memvalidasi objek dengan Rencana Anggaran Biaya (RAB)..." + spinner
  │     └── Step 4 (success): Tampilan success (lihat A5)
  └── Tombol "Mulai Verifikasi" (hanya tampil di step 0)
```

**Langkah A4 — Logika kamera dan simulasi:**

Saat modal dibuka (`showVideoModal = true`):
```javascript
useEffect(() => {
  if (!showVideoModal) return;
  
  // Aktifkan kamera
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      setCameraStream(stream);
      // Assign stream ke <video> element via ref
      if (videoRef.current) videoRef.current.srcObject = stream;
    })
    .catch(err => {
      setCameraError('Kamera tidak dapat diakses. Verifikasi tetap berjalan tanpa kamera.');
      // Lanjutkan simulasi meski tanpa kamera — jangan blokir flow
    });
    
  return () => {
    // Cleanup: matikan kamera saat modal ditutup
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  };
}, [showVideoModal]);
```

Saat tombol "Mulai Verifikasi" diklik:
```javascript
const startVerification = () => {
  setVerificationStep(1);
  
  // Detik 0-1.5: Step 1 - Face analysis
  setTimeout(() => setVerificationStep(2), 1500);
  
  // Detik 1.5-3: Step 2 - Timestamp
  setTimeout(() => setVerificationStep(3), 3000);
  
  // Detik 3-4.5: Step 3 - Object matching
  setTimeout(() => {
    setVerificationStep(4);
    // Matikan kamera setelah success
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  }, 4500);
};
```

**Langkah A5 — Success State (step 4):**

Tampilkan ini saat `verificationStep === 4`:

```jsx
<div className="[centered, success styling]">
  <div className="[large green checkmark]">✅</div>
  <h2>Verifikasi Valid!</h2>
  <p>Skor Kepercayaan: <strong>98%</strong></p>
  <p>Identitas pemilik UMKM terverifikasi.</p>
  <p>Proof of Delivery tervalidasi.</p>
  <p>Tranche siap dicairkan.</p>
  <div>[Badge] Verified On-Chain</div>
  <button onClick={closeModal}>Tutup</button>
</div>
```

**Langkah A6 — Fungsi closeModal:**
```javascript
const closeModal = () => {
  setShowVideoModal(false);
  setVerificationStep(0);
  setCameraError(null);
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
  }
};
```

**Langkah A7 — Spinner component:**

Gunakan spinner/loading indicator yang sudah ada di codebase.
Jika tidak ada, buat CSS animation sederhana:
```css
/* Inline style atau className yang sudah ada */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**CATATAN PENTING — Privacy:**
Tampilkan teks kecil di bawah preview kamera:
```
"🔒 Video tidak direkam atau dikirim ke server. Verifikasi dilakukan secara lokal."
```
Ini penting untuk meyakinkan juri bahwa ada "privacy by design".

**LARANGAN:**
- Jangan panggil API apapun di task ini — ini murni simulasi UI
- Jangan simpan atau upload video stream ke mana pun
- Jangan ubah komponen lain di UmkmDashboard di luar yang disebutkan

---

## ═══════════════════════════════════════
## TASK P3-B — Tambah Komentar InvestmentGate [Bug H-04]
## ═══════════════════════════════════════

**File:** `src/components/InvestmentGate.jsx`

### Masalah

Gate ini bisa di-bypass via localStorage manipulation. Ini acceptable karena
backend sudah aman, tapi perlu didokumentasikan agar developer lain tidak
mengira ini adalah security measure.

### Yang Harus Diimplementasikan

Tambahkan komentar ini di bagian atas komponen, setelah import statements:

```javascript
/**
 * InvestmentGate — UX GUARD (BUKAN Security Guard)
 *
 * Komponen ini memblokir akses ke UI investasi berdasarkan learningProgress
 * yang disimpan di Zustand store (localStorage).
 *
 * ⚠️ PENTING: Gate ini bisa di-bypass dengan manipulasi localStorage.
 * Ini adalah perilaku yang DISENGAJA karena:
 *   1. Backend middleware investmentGateMiddleware melakukan pengecekan
 *      independen di database sebelum memproses request investasi.
 *   2. Bypass di frontend hanya memperlihatkan UI — API tetap akan menolak
 *      request dari user yang learningProgress < 100 di database.
 *
 * Security ada di: backend/src/middleware/investmentGate.middleware.ts
 * Komponen ini hanya untuk UX — mencegah user yang belum selesai belajar
 * dari "melihat" form investasi sebelum waktunya.
 */
```

Tidak ada perubahan logika — hanya komentar ini.

---

## ═══════════════════════════════════════
## TASK P3-C — Fix Role Toggle Overlap di Arena [Bug L-03]
## ═══════════════════════════════════════

**File:** `src/pages/UmkmArena.jsx`

### Masalah

Toggle "Investor / Pengusaha UMKM" floating menutupi tombol "Lihat Detail"
pada beberapa ukuran layar.

### Yang Harus Diimplementasikan

Tambahkan padding-bottom pada container kartu UMKM:

Cari elemen container yang menampung semua kartu UMKM (kemungkinan `div`
dengan className grid atau flex). Tambahkan:
```
padding-bottom: 80px
```

Atau dalam Tailwind: `pb-20`

Jika toggle adalah `fixed` positioned, pastikan z-index kartu tidak
lebih tinggi dari toggle.

**Ini adalah perubahan 1-2 baris CSS/className.**

---

## ═══════════════════════════════════════
## TASK P3-D — Autocomplete & Form Fixes [Bug L-01, L-02]
## ═══════════════════════════════════════

**Files:** `src/pages/Login.jsx`, `src/pages/Register.jsx`

### Catatan

Bug L-01 (autocomplete attributes) dan L-02 (console warning "Password field
not in form") seharusnya sudah ditangani di P0 Task A dan B.

**Verifikasi saja bahwa kedua hal ini sudah ada setelah P0 diimplementasikan:**

- [ ] Login email input: `autocomplete="email"` ✓
- [ ] Login password input: `autocomplete="current-password"` ✓
- [ ] Register name input: `autocomplete="name"` ✓
- [ ] Register email input: `autocomplete="email"` ✓
- [ ] Register password input: `autocomplete="new-password"` ✓
- [ ] Register confirm password: `autocomplete="new-password"` ✓
- [ ] Console warning "Password field not in form" tidak muncul ✓

Jika ada yang belum dari P0, tambahkan di sini. Jika sudah semua ada,
cukup konfirmasi bahwa L-01 dan L-02 sudah resolved di P0.

---

## ════════════════════════════════════════
## DELIVERABLE P3 — FORMAT OUTPUT
## ════════════════════════════════════════

Urutan file yang harus di-output:
1. `src/pages/UmkmDashboard.jsx` — complete file (dengan video modal)
2. `src/components/InvestmentGate.jsx` — complete file (dengan komentar)
3. `src/pages/UmkmArena.jsx` — complete file (dengan padding fix, jika P2 belum cover ini)

Untuk setiap file, self-audit singkat:
```
SELF-AUDIT P3-[A/B/C/D] — [nama file]

UX:
  [✓/✗] Simulasi berjalan mulus tanpa error
  [✓/✗] Kamera dimatikan saat modal ditutup (tidak ada memory leak)
  [✓/✗] Error state jika kamera tidak bisa diakses ditangani

Privacy:
  [✓/✗] Tidak ada video yang dikirim ke server
  [✓/✗] Teks disclaimer kamera ada di modal

Demo Impact:
  [✓/✗] Wizard of Oz bisa didemonstrasikan tanpa backend
  [✓/✗] Success state terlihat meyakinkan untuk juri

RESULT: ✅ PASS / ❌ BLOCKED — [alasan]
```

---

## ════════════════════════════════════════
## SETELAH P3 SELESAI — VERIFIKASI MANUAL & FINAL
## ════════════════════════════════════════

### Checklist Verifikasi P3

**Test GEM-03 — Wizard of Oz:**
- [ ] Buka UmkmDashboard sebagai UMKM owner
- [ ] Klik tombol "Upload Video Unboxing"
- [ ] **Expected:** Modal muncul, kamera aktif (atau error graceful jika tidak ada kamera)
- [ ] Klik "Mulai Verifikasi"
- [ ] **Expected:** Teks berubah setiap ~1.5 detik melalui 3 tahap
- [ ] **Expected:** Setelah ~4.5 detik, success state muncul dengan skor 98%
- [ ] Klik Tutup
- [ ] **Expected:** Kamera mati, modal hilang

**Test H-04 — InvestmentGate komentar:**
- [ ] Buka `src/components/InvestmentGate.jsx`
- [ ] **Expected:** Komentar dokumentasi ada di atas komponen

**Test L-03 — Arena overlap:**
- [ ] Buka halaman Arena di browser width 768px (mobile/tablet)
- [ ] **Expected:** Tombol "Lihat Detail" tidak tertutup toggle

### Commit setelah verifikasi lulus:
```bash
git add src/pages/UmkmDashboard.jsx
git commit -m "feat(ui): wizard-of-oz video verification UI with webcam simulation [GEM-03]"

git add src/components/InvestmentGate.jsx
git commit -m "docs(security): add explicit UX-guard vs security-guard comment [H-04]"

git add src/pages/UmkmArena.jsx
git commit -m "fix(ui): add padding-bottom to prevent toggle overlap [L-03]"
```

---

## ════════════════════════════════════════
## SPRINT 6 FINAL CHECKLIST — SEBELUM MERGE KE MAIN
## ════════════════════════════════════════

Setelah semua P0–P3 selesai, jalankan full E2E test ini sebelum buka PR:

### Magic Moment 1 — Investment Gate
- [ ] Buat user baru via Register
- [ ] Login, buka halaman Arena
- [ ] Coba invest sebelum selesaikan modul belajar
- [ ] **Expected:** Terblokir di UI (InvestmentGate) DAN di API (backend middleware)
- [ ] Selesaikan modul belajar (set `learningProgress: 100` via database atau UI)
- [ ] Coba invest lagi
- [ ] **Expected:** Bisa lanjut ke flow pembayaran

### Magic Moment 2 — QRIS Payment
- [ ] Pilih UMKM, klik Invest, masukkan nominal
- [ ] **Expected:** QR code Xendit sandbox muncul
- [ ] Scan QR atau simulasikan payment via Xendit dashboard
- [ ] **Expected:** Status investasi berubah real-time (PENDING → ACTIVE)
- [ ] Cek tabel Investment di database
- [ ] **Expected:** Status = ACTIVE, xenditTxId terisi

### Magic Moment 3 — Merkle Root di Polygonscan
- [ ] Tunggu atau trigger manual Merkle batching
- [ ] **Expected:** TX hash muncul di UI
- [ ] Klik TX hash
- [ ] **Expected:** Membuka Polygon Amoy Explorer (amoy.polygonscan.com) dengan TX yang valid

### Security Check
- [ ] Coba login dengan kredensial kosong → harus gagal
- [ ] Coba hit blockchain endpoint tanpa token → harus 401
- [ ] Coba kirim webhook tanpa token di production mode → harus error

### Buka Pull Request:
```
Title: [Sprint 6] Security Hardening & Final Integration
Base: main
Compare: fix/sprint-6-hardening

Description:
## Bugs Fixed
### 🔴 Critical
- [C-01] Login.jsx auth bypass → now wired to auth store + backend
- [C-02] Blockchain routes unprotected → authMiddleware + adminGuard added
- [M-01] Register.jsx not wired → now calls POST /api/auth/register

### 🟠 High  
- [H-01] Missing required env vars → POLYGON_AMOY_RPC + RELAYER_PRIVATE_KEY added
- [H-02] Webhook bypass in sandbox → timingSafeEqual + NODE_ENV guard
- [H-03] No gas estimation → estimateGas() + safety buffer implemented
- [NEW] No distributed lock → redlock with retryCount: 0
- [NEW] No catch-up job → startup sync for missed transactions

### 🟡 Medium
- [M-04] UmkmDetail hardcoded → dynamic API call + real TX hash
- [NEW] UmkmArena hardcoded → dynamic API call + real funding progress
- [NEW] Premium payment → Xendit invoice flow
- [GEM-02] No anti-fraud → SHA-256 hashing + EXIF check
- [M-03] No rate limiting → 30 req/min on blockchain read endpoints

### 🟢 Low
- [GEM-03] Video verification UI → Wizard of Oz simulation with webcam
- [H-04] InvestmentGate undocumented → explicit UX-guard comment added
- [L-03] Toggle overlap → padding-bottom fix

## Testing
- [ ] E2E: Magic Moment 1 (Investment Gate)
- [ ] E2E: Magic Moment 2 (QRIS Payment)
- [ ] E2E: Magic Moment 3 (Polygonscan TX)
- [ ] Security: Auth bypass attempts blocked
- [ ] Security: Blockchain endpoints protected
```

---

**Sprint 6 selesai. Platform siap demo. 🚀**
