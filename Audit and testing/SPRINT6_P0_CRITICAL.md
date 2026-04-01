# SPRINT 6 — P0 CRITICAL
## Auth Bypass & Blockchain Route Protection

**Branch:** `fix/sprint-6-hardening`
**Prioritas:** 🔴 CRITICAL — Kerjakan ini PERTAMA. Jangan lanjut ke P1 sebelum selesai.
**Estimasi total:** ~75 menit
**Bug yang ditutup:** C-01, M-01, C-02

---

## KONTEKS P0

Dua bug berikut adalah **demo blocker absolut**:

1. **C-01** — `Login.jsx` langsung redirect ke dashboard tanpa autentikasi apapun.
   Siapapun bisa akses dashboard tanpa login.

2. **M-01** — `Register.jsx` tidak memanggil API backend.
   User baru tidak bisa mendaftar secara real — tidak ada data di database.

3. **C-02** — Endpoint blockchain admin (`record-merkle`, `record-tranche`) publik total.
   Siapapun bisa tulis data palsu ke Polygon dan drain MATIC relayer.

Bug C-01 dan M-01 harus dikerjakan **bersamaan** — tidak ada gunanya login berfungsi
jika tidak ada user yang terdaftar di database.

---

## ═══════════════════════════════════════
## TASK P0-A — Fix Login.jsx [Bug C-01]
## ═══════════════════════════════════════

**File:** `src/pages/Login.jsx`

### Masalah Saat Ini

```jsx
// INI YANG ADA SEKARANG — SALAH TOTAL:
const handleLogin = () => {
  navigate('/dashboard'); // Langsung redirect tanpa cek apapun
};

// Input tidak terkontrol:
<input defaultValue="user@example.com" />
<input defaultValue="password123" type="password" />
```

### Yang Harus Diimplementasikan

**Langkah A1 — Tambah state variables:**
```
useState untuk: email, password, error, isLoading
```

**Langkah A2 — Ubah semua input menjadi controlled:**
- Ganti `defaultValue` dengan `value` + `onChange`
- HAPUS semua hardcoded credential (`"password123"`, email apapun)
- Tambah `autocomplete="email"` pada input email
- Tambah `autocomplete="current-password"` pada input password

**Langkah A3 — Rewrite handleLogin menjadi async:**

Urutan eksekusi yang benar:
1. `e.preventDefault()` — cegah form submission default
2. Clear error state: `setError('')`
3. Validasi: jika email atau password kosong → `setError('Email dan password wajib diisi')` → return
4. `setIsLoading(true)`
5. Di dalam `try`:
   - Panggil `await login({ email, password })` dari Zustand auth store
   - Baca `user.role` dari state setelah login berhasil
   - Navigate berdasarkan role:
     - `'INVESTOR'` → `/dashboard`
     - `'UMKM_OWNER'` → `/umkm-dashboard`
     - default → `/dashboard`
6. Di dalam `catch`:
   - `setError(err.message || 'Login gagal. Periksa email dan password Anda.')`
7. Di dalam `finally`:
   - `setIsLoading(false)`

**Langkah A4 — Sambungkan error dan loading ke UI:**
- Tampilkan `error` sebagai teks merah di bawah form jika tidak kosong
- Clear error saat user mulai mengetik (pada `onChange` manapun)
- Disable tombol submit dan ubah teks menjadi `"Memproses..."` saat `isLoading === true`

**Langkah A5 — Import yang dibutuhkan:**
```javascript
import { useAuthStore } from '../stores/auth.store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
```

**LARANGAN:**
- Jangan ubah apapun di luar logic yang disebutkan di atas
- Jangan ubah styling, layout, atau komponen lain
- Jangan tambahkan import yang tidak dibutuhkan

---

## ════════════════════════════════════════
## TASK P0-B — Wire Register.jsx ke API [Bug M-01]
## ════════════════════════════════════════

**File:** `src/pages/Register.jsx`

### Masalah Saat Ini

Form multi-step mengumpulkan data (nama, email, telepon, password, role, T&C)
tapi tombol final submit hanya melakukan navigasi lokal tanpa API call.

### Yang Harus Diimplementasikan

**Langkah B1 — Tambah state untuk loading dan error pada step final:**
```
useState untuk: isLoading, submitError
```

**Langkah B2 — Validasi sebelum submit (client-side, berjalan sebelum API call):**
- Password dan confirmPassword harus identik → tampilkan error inline jika tidak
- Checkbox terms harus dicentang → tampilkan error inline jika tidak
- Validasi ini harus berjalan SEBELUM memanggil auth store

**Langkah B3 — Submit handler pada step final:**

Urutan eksekusi:
1. Jalankan validasi B2 — return jika gagal
2. `setIsLoading(true)`
3. Di dalam `try`:
   - Panggil `await register({ name, email, password, role })` dari Zustand auth store
   - Data `phone` disertakan jika action `register()` menerimanya
   - Jika tidak yakin dengan signature `register()`, gunakan asumsi ini dan nyatakan:
     ```
     ⚠️ ASUMSI: register() menerima { name, email, password, role, phone? }
     ```
   - Navigate setelah berhasil:
     - `role === 'INVESTOR'` → `/dashboard`
     - `role === 'UMKM_OWNER'` → `/umkm-dashboard`
4. Di dalam `catch`:
   - `setSubmitError(err.message || 'Pendaftaran gagal. Coba lagi.')`
   - Tampilkan error di UI step final
5. Di dalam `finally`:
   - `setIsLoading(false)`

**Langkah B4 — Perbaikan teknis:**
- Pastikan semua input password berada di dalam elemen `<form>` yang valid
  (untuk menghilangkan console warning "Password field not in form")
- Tambah `autocomplete` attributes:
  - Nama: `autocomplete="name"`
  - Email: `autocomplete="email"`
  - Password: `autocomplete="new-password"`
  - Confirm Password: `autocomplete="new-password"`

**Langkah B5 — Sambungkan ke UI:**
- Disable tombol "Buat Akun" dan tampilkan `"Mendaftarkan..."` saat loading
- Tampilkan `submitError` sebagai pesan error merah pada step final

---

## ════════════════════════════════════════
## TASK P0-C — Protect Blockchain Routes [Bug C-02]
## ════════════════════════════════════════

**File:** `backend/src/routes/blockchain.routes.ts`

### Masalah Saat Ini

```typescript
// INI YANG ADA SEKARANG — TIDAK ADA PROTEKSI:
router.post('/record-merkle', asyncHandler(recordMerkleRoot));
router.post('/record-tranche', asyncHandler(recordTranche));
// Siapapun bisa hit endpoint ini tanpa token
```

### Yang Harus Diimplementasikan

**Langkah C1 — Import authMiddleware:**
```typescript
import { authMiddleware } from '../middleware/auth';
```

**Langkah C2 — Buat adminGuard middleware:**

Cek apakah `adminGuard` sudah ada di `backend/src/middleware/adminGuard.ts`.
Jika sudah ada, import saja. Jika belum, buat inline di file ini:

```typescript
// Logika adminGuard yang harus diimplementasikan:
// 1. Cek req.user ada (authMiddleware harus sudah jalan)
// 2. Cek req.user.role === 'ADMIN'
// 3. Jika gagal: return res.status(403).json({ error: 'Forbidden: admin access required' })
// 4. Jika lulus: next()
```

Jika role `ADMIN` tidak ada di Prisma enum, gunakan alternatif ini dan nyatakan asumsinya:
```typescript
// Alternatif: cek header internal secret
// Header: 'x-internal-secret'
// Bandingkan dengan: process.env.ADMIN_INTERNAL_SECRET
```

**Langkah C3 — Terapkan middleware HANYA pada dua route ini:**
```typescript
router.post('/record-merkle', authMiddleware, adminGuard, asyncHandler(recordMerkleRoot));
router.post('/record-tranche', authMiddleware, adminGuard, asyncHandler(recordTranche));
```

**Langkah C4 — Jangan ubah route GET:**
Route `GET /health` dan `GET /stats` adalah read-only publik — biarkan apa adanya.

**LARANGAN:**
- Jangan tambahkan auth ke route GET
- Jangan ubah handler function yang sudah ada
- Jangan ubah struktur router di luar dua route yang disebutkan

---

## ════════════════════════════════════════
## DELIVERABLE P0 — FORMAT OUTPUT
## ════════════════════════════════════════

Untuk setiap task, berikan:

1. **File lengkap** dari atas sampai bawah (BUKAN diff, BUKAN snippet)
2. **Self-audit** dengan format ini persis:

```
SELF-AUDIT P0-[A/B/C] — [nama file]

Logic:
  [✓/✗] Flow utama benar dari input ke output
  [✓/✗] Semua edge case ditangani

Security:
  [✓/✗] Tidak ada hardcoded credential
  [✓/✗] Input divalidasi sebelum digunakan
  [✓/✗] Auth check ada sebelum operasi sensitif

Idempotency:
  [✓/✗] N/A (frontend) ATAU ada uniqueness check (backend)

Error Handling:
  [✓/✗] Try-catch pada semua async operation
  [✓/✗] Error message ditampilkan ke user

Assumptions made:
  - [list asumsi jika ada, atau "Tidak ada"]

RESULT: ✅ PASS / ❌ BLOCKED — [alasan]
```

---

## ════════════════════════════════════════
## SETELAH P0 SELESAI — VERIFIKASI MANUAL
## ════════════════════════════════════════

Setelah Opus selesai generate semua file P0, lakukan langkah verifikasi ini
sebelum melanjutkan ke P1:

### Checklist Verifikasi P0

**Test C-01 — Login bypass dihilangkan:**
- [ ] Buka `http://localhost:5173/login`
- [ ] Kosongkan email dan password, klik "Masuk"
- [ ] **Expected:** Muncul error "Email dan password wajib diisi", TIDAK redirect
- [ ] Isi email/password salah, klik "Masuk"
- [ ] **Expected:** Muncul error dari backend, TIDAK redirect
- [ ] Isi email/password benar (user yang ada di DB), klik "Masuk"
- [ ] **Expected:** Redirect ke `/dashboard` atau `/umkm-dashboard` sesuai role

**Test M-01 — Register terhubung ke backend:**
- [ ] Buka `http://localhost:5173/register`
- [ ] Isi form sampai selesai dengan data baru
- [ ] **Expected:** Data user tersimpan di PostgreSQL (cek via Prisma Studio)
- [ ] Login dengan credential yang baru didaftarkan
- [ ] **Expected:** Berhasil masuk

**Test C-02 — Blockchain routes terlindungi:**
- [ ] Jalankan command ini tanpa token:
  ```bash
  curl -X POST http://localhost:4000/api/blockchain/record-tranche \
    -H "Content-Type: application/json" \
    -d '{"umkmId":"test","trancheId":"test","amountIdr":1000,"trancheStage":1,"aiScore":90}'
  ```
- [ ] **Expected:** Response `401 Unauthorized`
- [ ] Jalankan dengan token user biasa (bukan admin):
  ```bash
  curl -X POST http://localhost:4000/api/blockchain/record-tranche \
    -H "Authorization: Bearer [USER_TOKEN]" \
    -H "Content-Type: application/json" \
    -d '...'
  ```
- [ ] **Expected:** Response `403 Forbidden`

### Commit setelah verifikasi lulus:
```bash
git add src/pages/Login.jsx
git commit -m "fix(auth): wire Login.jsx to auth store and backend API [C-01]"

git add src/pages/Register.jsx
git commit -m "fix(auth): wire Register.jsx to POST /api/auth/register [M-01]"

git add backend/src/routes/blockchain.routes.ts
git commit -m "fix(security): add authMiddleware + adminGuard to blockchain routes [C-02]"
```

---

**Setelah semua commit di atas dilakukan dan verifikasi lulus → Lanjut ke SPRINT6_P1_HIGH.md**
