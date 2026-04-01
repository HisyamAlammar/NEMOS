# SPRINT 6 — P2 MEDIUM
## Dynamic Data Wiring + AI Anti-Fraud Image Hashing

**Branch:** `fix/sprint-6-hardening`
**Prioritas:** 🟡 MEDIUM — Kerjakan setelah P1 selesai dan ter-verifikasi
**Estimasi total:** ~155 menit
**Bug yang ditutup:** M-04, NEW (UmkmArena dynamic), NEW (Premium payment), GEM-02, M-03

---

## PRASYARAT

Sebelum mengerjakan P2, konfirmasi bahwa P1 sudah selesai:
- [ ] `env.ts` sudah punya `POLYGON_AMOY_RPC` dan `RELAYER_PRIVATE_KEY`
- [ ] Webhook signature tidak bisa di-bypass di production
- [ ] Gas estimation ada sebelum setiap blockchain TX
- [ ] Redlock terpasang di cron job dan catch-up job ada di startup
- [ ] Semua commit P1 sudah ada di branch

Jika belum, **STOP** dan selesaikan P1 dulu.

---

## ═══════════════════════════════════════
## TASK P2-A — Wire UmkmDetail.jsx ke Backend API [Bug M-04]
## ═══════════════════════════════════════

**File:** `src/pages/UmkmDetail.jsx`

### Masalah

Seluruh data UMKM (nama, lokasi, target, current funding, tranche info) hardcoded
di file JSX. TX hash yang tampil (`0xA1b2...C3d4`) adalah palsu — jika juri klik,
Polygonscan tidak akan menemukan transaksi tersebut. **Ini langsung membunuh Magic Moment 3.**

### Yang Harus Diimplementasikan

**Langkah A1 — Hapus UMKM_DATA hardcoded:**
Hapus atau comment out seluruh object `UMKM_DATA` atau apapun konstanta hardcoded
yang berisi data UMKM di bagian atas file.

**Langkah A2 — Tambah state dan fetch logic:**
```
useState untuk: umkm (null), loading (true), error (null)
useParams untuk: id (dari URL /detail/:id)
useEffect untuk: fetch data saat komponen mount atau id berubah
```

**Langkah A3 — Fetch UMKM data dari backend:**

Endpoint yang dipanggil: `GET /api/umkm/:id`

Gunakan API wrapper yang sudah ada di `src/api.js` atau `src/utils/api.js`
(cari file ini dulu — jangan buat baru jika sudah ada).

```
Saat fetch:
  → Set loading = true
  → Panggil GET /api/umkm/:id
  → Set umkm = response.data
  → Set loading = false

Jika error:
  → Set error = 'Gagal memuat data UMKM'
  → Set loading = false
```

**Langkah A4 — Fetch TX hash dari blockchain:**

Setelah data UMKM berhasil dimuat, fetch transaction data:
- Endpoint: `GET /api/blockchain/umkm-transactions/:umkmId`
- Atau: cek di field `transactions` yang mungkin sudah di-include di response UMKM
- TX hash yang ditampilkan di "Verified by Blockchain" badge harus dari
  field `polygonTxHash` di data `Transaction` dari database, bukan hardcoded

Jika endpoint ini belum ada di backend:
```
⚠️ BLOCKED (PARTIAL): TX hash tidak bisa ditampilkan secara dinamis karena
endpoint GET /api/blockchain/umkm-transactions/:umkmId belum ada.
Untuk sementara: sembunyikan "Verified by Blockchain" badge jika txHash null.
Jangan tampilkan hash palsu.
```

**Langkah A5 — Tampilkan loading dan error state:**
```jsx
if (loading) return <div>Memuat data UMKM...</div>
if (error) return <div>{error}</div>
if (!umkm) return <div>UMKM tidak ditemukan</div>
```

**Langkah A6 — Ganti semua referensi data hardcoded:**
Setiap tempat yang sebelumnya menggunakan `UMKM_DATA.fieldName` harus
diganti dengan `umkm.fieldName` (atau nama field yang sesuai dari API response).

**Langkah A7 — Pastikan funding progress akurat:**
```
Current funding: umkm.current (BigInt dari database, convert ke tampilan Rupiah)
Target funding: umkm.target (BigInt dari database)
Progress: (current / target) * 100
```

Catatan Dev 1: "pastikan tampilan investor dan pengusaha saling berkorelasi,
belum ada pendanaan biarkan 0 dan bertambah seiring adanya pendanaan".
Ini berarti nilai `current` harus benar-benar dari database, bukan hardcoded.

---

## ═══════════════════════════════════════
## TASK P2-B — Wire UmkmArena.jsx ke Backend API [Bug NEW]
## ═══════════════════════════════════════

**File:** `src/pages/UmkmArena.jsx`

### Masalah

Daftar UMKM di halaman Arena hardcoded. Tidak ada API call ke backend.
Akibatnya progress pendanaan setiap UMKM tidak pernah berubah meski ada
investor yang sudah invest.

### Yang Harus Diimplementasikan

**Langkah B1 — Tambah state dan fetch:**
```
useState untuk: umkmList ([]), loading (true), error (null)
useEffect untuk: fetch saat komponen mount
```

**Langkah B2 — Fetch daftar UMKM:**

Endpoint: `GET /api/umkm` (dengan query params untuk filter jika ada)

Kemungkinan query params berdasarkan filter yang ada di UI:
- `?tier=FREE` atau `?tier=PREMIUM` (untuk tier gating)
- `?grade=A` atau `?grade=B` atau `?grade=C`
- `?sector=kuliner` dll

Cek filter apa yang ada di UI Arena saat ini dan sesuaikan.

**Langkah B3 — Tier gating dari Auth Store:**

Saat ini ada logic tier gating (Free user hanya lihat Grade C).
Logic ini harus tetap ada tapi validasinya dikembalikan ke backend:
- Baca `user.tier` dari auth store
- Kirim sebagai query param atau header ke backend: `?userTier=FREE`
- Backend yang memutuskan UMKM mana yang dikembalikan
- Frontend hanya menampilkan apa yang dikembalikan

**Langkah B4 — Handle empty state:**
```jsx
if (umkmList.length === 0 && !loading) {
  return <div>Belum ada UMKM yang tersedia saat ini.</div>
}
```

**Langkah B5 — Data mapping:**
Pastikan setiap card UMKM di Arena menampilkan:
- `umkm.name` — nama usaha
- `umkm.category` — sektor/kategori
- `umkm.grade` — grade (A/B/C)
- Progress: `(umkm.current / umkm.target) * 100` — dari data real database
- Link ke `/detail/${umkm.id}`

---

## ═══════════════════════════════════════
## TASK P2-C — Wire Premium Payment Gateway [Catatan Dev 1]
## ═══════════════════════════════════════

**Files:** Frontend tier upgrade flow + backend endpoint terkait

### Konteks

Catatan Dev 1: "benerin pembayaran fitur premium dengan payment gateway".
User dengan tier FREE harus bisa upgrade ke PREMIUM dengan membayar
Rp 49.000/bulan via Xendit.

### Yang Harus Diimplementasikan

**Langkah C1 — Identifikasi titik UI upgrade:**
Temukan di mana tombol "Upgrade ke Premium" berada (kemungkinan di:
- `src/pages/UmkmArena.jsx` saat user FREE mencoba akses UMKM grade A/B
- `src/pages/Dashboard.jsx` di section tier info
- `src/components/TierGate.jsx` atau sejenisnya)

**Langkah C2 — Frontend upgrade flow:**

Saat tombol upgrade diklik:
```
1. Panggil POST /api/payments/create-premium-invoice
   Body: { userId: user.id }
2. Backend returns: { invoiceUrl: '...', invoiceId: '...' }
3. Redirect user ke invoiceUrl (Xendit hosted payment page)
   Atau tampilkan QRIS code jika backend returns QR
```

**Langkah C3 — Backend endpoint baru (jika belum ada):**

`POST /api/payments/create-premium-invoice`

Logic:
```
1. Verifikasi user dari JWT (authMiddleware)
2. Cek user.tier — jika sudah PREMIUM, return error 400
3. Buat Xendit Invoice dengan:
   - amount: 49000
   - description: 'NEMOS Premium Subscription'
   - customer: { name: user.name, email: user.email }
   - success_redirect_url: frontend URL /upgrade-success
4. Simpan xenditInvoiceId ke database (buat field atau tabel baru jika perlu)
5. Return { invoiceUrl, invoiceId }
```

**Langkah C4 — Webhook handler untuk invoice paid:**

Di Xendit webhook handler yang sudah ada, tambahkan case untuk invoice paid:
```
Jika event type adalah 'invoice.paid' atau 'PAID':
  1. Cek idempotency: cari di database berdasarkan xenditInvoiceId
  2. Jika sudah diproses: return 200 already_processed
  3. Jika belum: update User.tier = 'PREMIUM' di database
  4. Tandai sebagai processed
```

**Langkah C5 — Halaman success (jika belum ada):**

Buat atau update halaman `/upgrade-success`:
```jsx
// Tampilkan: "Selamat! Akun kamu sudah di-upgrade ke Premium."
// Tampilkan: user.tier dari auth store (harus di-refresh setelah upgrade)
// Tombol: "Lihat UMKM Premium" → navigate ke /arena
```

Jangan lupa refresh auth store setelah landing di halaman ini agar
`user.tier` berubah dari FREE ke PREMIUM di Zustand state.

---

## ═══════════════════════════════════════
## TASK P2-D — AI Image Hashing Anti-Fraud [Bug GEM-02]
## ═══════════════════════════════════════

**Files:**
- `ai-service/services/gemini_service.py` (modifikasi)
- `backend/src/routes/internal.routes.ts` (baru — jika belum ada)
- `backend/prisma/schema.prisma` (modifikasi — tambah kolom)

### Masalah

Tidak ada pengecekan duplikat sebelum panggil Gemini Vision API. UMKM bisa
submit struk yang sama berkali-kali untuk trigger multiple tranche releases.
Setiap call ke Gemini menghabiskan kuota token.

### Yang Harus Diimplementasikan

#### D1 — Prisma Schema Update

Tambahkan kolom `receiptHash` ke model `Tranche`:
```prisma
model Tranche {
  // ... kolom yang sudah ada ...
  receiptHash  String?  @unique  // SHA-256 hash dari gambar struk
}
```

Setelah update schema, jalankan:
```bash
npx prisma migrate dev --name add-receipt-hash
npx prisma generate
```

#### D2 — Backend Internal Endpoints (baru)

Buat file `backend/src/routes/internal.routes.ts`:

**Endpoint 1: `POST /api/internal/check-receipt-hash`**
```
Body: { hash: string, trancheId: string }
Logic:
  1. Cari Tranche di database dengan receiptHash === hash
  2. Jika ditemukan: return 409 { error: 'Duplicate', trancheId: found.id }
  3. Jika tidak: return 200 { status: 'unique' }

Auth: Endpoint ini hanya bisa dipanggil dari AI Microservice (internal).
Gunakan header 'x-internal-key' yang dibandingkan dengan env var INTERNAL_API_KEY.
Jika tidak match: return 401.
```

**Endpoint 2: `POST /api/internal/store-receipt-hash`**
```
Body: { hash: string, trancheId: string }
Logic:
  1. Update Tranche dengan id === trancheId: set receiptHash = hash
  2. Gunakan Prisma $transaction untuk atomic update
  3. Return 200 { status: 'stored' }

Auth: Sama — x-internal-key header check.
```

Daftarkan kedua endpoint ini di `server.ts`:
```typescript
app.use('/api/internal', internalRoutes);
```

#### D3 — Python: Utility Function `compute_image_hash`

Di `ai-service/services/gemini_service.py`, tambahkan:

```python
import hashlib

def compute_image_hash(image_bytes: bytes) -> str:
    """
    Menghitung SHA-256 hash dari bytes gambar.
    Fungsi ini pure — tidak ada side effects atau I/O.
    """
    return hashlib.sha256(image_bytes).hexdigest()
```

#### D4 — Python: EXIF Metadata Check

Tambahkan import:
```python
from PIL import Image
from PIL.ExifTags import TAGS
import io
```

Buat fungsi `check_exif_metadata`:
```python
def check_exif_metadata(image_bytes: bytes) -> dict:
    """
    Mengecek EXIF metadata gambar.
    Returns: { has_timestamp: bool, confidence_penalty: int, flag: str | None }
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif()  # Returns None jika tidak ada EXIF
        
        if exif_data is None:
            # Tidak ada EXIF sama sekali — kemungkinan screenshot atau download
            return {
                "has_timestamp": False,
                "confidence_penalty": 25,
                "flag": "NO_EXIF: Gambar tidak memiliki metadata EXIF. Kemungkinan screenshot atau unduhan."
            }
        
        # Tag EXIF 36867 = DateTimeOriginal
        DATE_TIME_ORIGINAL_TAG = 36867
        has_timestamp = DATE_TIME_ORIGINAL_TAG in exif_data
        
        if not has_timestamp:
            return {
                "has_timestamp": False,
                "confidence_penalty": 15,
                "flag": "NO_TIMESTAMP: EXIF ada tapi tidak memiliki DateTimeOriginal."
            }
        
        return {
            "has_timestamp": True,
            "confidence_penalty": 0,
            "flag": None
        }
    except Exception:
        # Jika tidak bisa baca EXIF sama sekali
        return {
            "has_timestamp": False,
            "confidence_penalty": 20,
            "flag": "EXIF_READ_ERROR: Tidak bisa membaca metadata gambar."
        }
```

#### D5 — Python: Modifikasi Endpoint `verify_receipt`

Di endpoint `/ocr/verify-receipt`, SEBELUM memanggil Gemini:

```
LANGKAH 1 — Baca bytes gambar:
  image_bytes = await image.read()

LANGKAH 2 — Hitung hash:
  image_hash = compute_image_hash(image_bytes)

LANGKAH 3 — Cek duplikat ke backend:
  Panggil POST {BACKEND_URL}/api/internal/check-receipt-hash
  Header: { 'x-internal-key': INTERNAL_API_KEY }
  Body: { 'hash': image_hash, 'trancheId': tranche_id }
  
  Jika response 409:
    raise HTTPException(status_code=400, detail={
      "error": "Duplicate Receipt Detected",
      "message": "Struk ini sudah pernah digunakan. Harap unggah struk yang berbeda.",
      "hash": image_hash
    })

LANGKAH 4 — Cek EXIF metadata:
  exif_result = check_exif_metadata(image_bytes)

LANGKAH 5 — Modifikasi prompt Gemini jika ada EXIF flag:
  Jika exif_result['flag'] tidak None:
    Tambahkan ke prompt: f"\nWARNING: {exif_result['flag']}. Terapkan scrutiny lebih ketat."

LANGKAH 6 — Panggil Gemini Vision (logika yang sudah ada)

LANGKAH 7 — Setelah mendapat confidence score dari Gemini:
  final_confidence = gemini_confidence - exif_result['confidence_penalty']
  final_confidence = max(0, final_confidence)  # Jangan negatif
  
  Jika final_confidence < 85:
    is_valid = False

LANGKAH 8 — Simpan hash ke backend (hanya jika verifikasi berhasil):
  Panggil POST {BACKEND_URL}/api/internal/store-receipt-hash
  Header: { 'x-internal-key': INTERNAL_API_KEY }
  Body: { 'hash': image_hash, 'trancheId': tranche_id }

LANGKAH 9 — Return response dengan hash disertakan:
  return {
    "isValid": is_valid,
    "confidence": final_confidence,
    "imageHash": image_hash,
    "exifFlag": exif_result['flag'],
    ...rest of response
  }
```

**Env var yang dibutuhkan di AI service:**
```
BACKEND_URL=http://localhost:4000
INTERNAL_API_KEY=           # Sama dengan yang di backend .env
```

**Env var yang dibutuhkan di backend:**
```
INTERNAL_API_KEY=           # Secret key untuk komunikasi internal
```

#### D6 — Tambah ke `.env.example` backend:
```
INTERNAL_API_KEY=           # Internal API key for AI microservice communication
```

---

## ═══════════════════════════════════════
## TASK P2-E — Rate Limiting Blockchain Read Endpoints [Bug M-03]
## ═══════════════════════════════════════

**File:** `backend/src/routes/blockchain.routes.ts`

### Masalah

`GET /api/blockchain/health` dan `GET /api/blockchain/stats` memanggil
`provider.getBalance()` dan contract functions setiap request. Tanpa rate limiting,
spam request bisa menghabiskan Alchemy quota.

### Yang Harus Diimplementasikan

**Langkah E1 — Cek apakah `express-rate-limit` sudah di package.json:**
- Jika sudah: import dan gunakan
- Jika belum: catat `npm install express-rate-limit` dan implementasikan

**Langkah E2 — Buat rate limiter untuk blockchain read endpoints:**
```typescript
import rateLimit from 'express-rate-limit';

const blockchainReadLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 menit
  max: 30,                 // 30 request per menit per IP
  message: {
    error: 'Too many requests to blockchain endpoints. Please wait 1 minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Langkah E3 — Terapkan HANYA pada GET endpoints:**
```typescript
router.get('/health', blockchainReadLimiter, asyncHandler(getHealth));
router.get('/stats', blockchainReadLimiter, asyncHandler(getStats));
```

Jangan terapkan ke POST endpoints (mereka sudah punya authMiddleware).

---

## ════════════════════════════════════════
## DELIVERABLE P2 — FORMAT OUTPUT
## ════════════════════════════════════════

Urutan file yang harus di-output:
1. `backend/prisma/schema.prisma` — complete file (dengan perubahan receiptHash)
2. `backend/src/routes/internal.routes.ts` — complete file (baru)
3. `backend/src/routes/blockchain.routes.ts` — complete file (dengan rate limiter)
4. `ai-service/services/gemini_service.py` — complete file
5. `src/pages/UmkmDetail.jsx` — complete file
6. `src/pages/UmkmArena.jsx` — complete file
7. Frontend premium payment flow (file terkait)

Catatan migrasi:
```
SETELAH schema.prisma diupdate:
npx prisma migrate dev --name add-receipt-hash
npx prisma generate
```

Untuk setiap file, sertakan self-audit:
```
SELF-AUDIT P2-[A/B/C/D/E] — [nama file]

Data Integrity:
  [✓/✗] Tidak ada hardcoded data yang mempengaruhi demo
  [✓/✗] TX hash dari database, bukan palsu

API Integration:
  [✓/✗] Semua fetch dibungkus try-catch
  [✓/✗] Loading dan error state ditampilkan ke user
  [✓/✗] Empty state ditangani dengan pesan yang jelas

Anti-Fraud:
  [✓/✗] SHA-256 hash dihitung sebelum panggil Gemini
  [✓/✗] Dedup check dilakukan sebelum proses
  [✓/✗] EXIF check mengurangi confidence score jika flag ditemukan
  [✓/✗] Hash disimpan hanya setelah verifikasi sukses

Internal API Security:
  [✓/✗] x-internal-key header check ada
  [✓/✗] Internal endpoints tidak bisa diakses publik

Migration:
  [✓/✗] Schema change dicatat dengan perintah migrate yang eksplisit
  [N/A] Jika tidak ada schema change

RESULT: ✅ PASS / ❌ BLOCKED — [alasan]
```

---

## ════════════════════════════════════════
## SETELAH P2 SELESAI — VERIFIKASI MANUAL
## ════════════════════════════════════════

### Checklist Verifikasi P2

**Test M-04 — UmkmDetail dynamic:**
- [ ] Buka `/detail/[id-umkm-yang-ada-di-db]`
- [ ] **Expected:** Data UMKM muncul dari database, bukan hardcoded
- [ ] Buka `/detail/id-yang-tidak-ada`
- [ ] **Expected:** Error state muncul, bukan crash
- [ ] Lakukan investasi kecil di sandbox
- [ ] **Expected:** Nilai `current` di halaman detail berubah

**Test UmkmArena dynamic:**
- [ ] Buka `/arena`
- [ ] **Expected:** Daftar UMKM dari database, bukan hardcoded
- [ ] Login sebagai user FREE, buka arena
- [ ] **Expected:** Hanya UMKM grade C yang muncul

**Test premium payment:**
- [ ] Login sebagai user FREE
- [ ] Coba akses UMKM grade A
- [ ] **Expected:** Muncul prompt upgrade
- [ ] Klik upgrade, selesaikan pembayaran di Xendit sandbox
- [ ] **Expected:** `user.tier` berubah menjadi PREMIUM

**Test GEM-02 — Image hashing:**
- [ ] Upload struk ke endpoint AI service
- [ ] **Expected:** Berhasil diproses, hash tersimpan
- [ ] Upload struk yang SAMA lagi
- [ ] **Expected:** Error 400 "Duplicate Receipt Detected"
- [ ] Upload struk tanpa EXIF (screenshot)
- [ ] **Expected:** Confidence score dikurangi 25 poin, ada flag di response

### Commit setelah verifikasi lulus:
```bash
git add backend/prisma/ backend/src/routes/internal.routes.ts
git commit -m "feat(db): add receiptHash column to Tranche + internal endpoints [GEM-02]"

git add ai-service/
git commit -m "feat(ai): add SHA-256 image hashing and EXIF check for duplicate prevention [GEM-02]"

git add src/pages/UmkmDetail.jsx src/pages/UmkmArena.jsx
git commit -m "fix(frontend): wire UmkmDetail and UmkmArena to backend API [M-04]"

git add backend/src/routes/blockchain.routes.ts
git commit -m "fix(security): add rate limiting to blockchain read endpoints [M-03]"
```

---

**Setelah semua commit di atas dilakukan dan verifikasi lulus → Lanjut ke SPRINT6_P3_LOW.md**
