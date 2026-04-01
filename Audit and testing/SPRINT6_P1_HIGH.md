# SPRINT 6 — P1 HIGH
## Env Variables, Webhook Signature, Gas Estimation & Redlock

**Branch:** `fix/sprint-6-hardening`
**Prioritas:** 🟠 HIGH — Kerjakan setelah P0 selesai dan ter-verifikasi
**Estimasi total:** ~80 menit
**Bug yang ditutup:** H-01, H-02, H-03, NEW (Redlock + Catch-up Job)

---

## PRASYARAT

Sebelum mengerjakan P1, konfirmasi bahwa P0 sudah selesai:
- [ ] `Login.jsx` sudah terhubung ke auth store dan backend
- [ ] `Register.jsx` sudah terhubung ke `POST /api/auth/register`
- [ ] Blockchain routes sudah terlindungi `authMiddleware` + `adminGuard`
- [ ] Ketiga commit P0 sudah ada di branch `fix/sprint-6-hardening`

Jika belum, **STOP** dan selesaikan P0 dulu.

---

## ═══════════════════════════════════════
## TASK P1-A — Tambah Required Env Vars [Bug H-01]
## ═══════════════════════════════════════

**File:** `backend/src/config/env.ts`

### Masalah

`POLYGON_AMOY_RPC` dan `RELAYER_PRIVATE_KEY` tidak ada di array `requiredEnvVars`.
Server bisa start tanpa error meskipun kedua variabel ini kosong, lalu relayer
gagal diam-diam saat runtime. Ini **melanggar Rule 8 secara eksplisit**.

### Yang Harus Diimplementasikan

Tambahkan tepat dua string ini ke dalam array `requiredEnvVars` yang sudah ada:
```
"POLYGON_AMOY_RPC"
"RELAYER_PRIVATE_KEY"
```

Jangan hapus entry yang sudah ada. Jangan ubah apapun selain array tersebut.

**Ini adalah perubahan 2 baris. Jangan over-engineer.**

Hasil akhir array harus mencakup minimal:
```typescript
const requiredEnvVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
  "XENDIT_SECRET_KEY",
  "NEMOS_CONTRACT_ADDRESS",
  "POLYGON_AMOY_RPC",        // ← DITAMBAHKAN
  "RELAYER_PRIVATE_KEY",     // ← DITAMBAHKAN
] as const;
```

---

## ═══════════════════════════════════════
## TASK P1-B — Fix Webhook Signature Verification [Bug H-02]
## ═══════════════════════════════════════

**File:** `backend/src/services/xendit.service.ts`

### Masalah

Fungsi `verifyWebhookSignature` return `true` ketika `webhookToken` kosong.
Karena `XENDIT_WEBHOOK_TOKEN` default ke `""` di sandbox, semua webhook
request diterima tanpa verifikasi. Penyerang bisa inject fake payment completions.

### Contoh request berbahaya yang saat ini BERHASIL:
```bash
curl -X POST http://localhost:4000/api/webhooks/xendit \
  -H "Content-Type: application/json" \
  -d '{"id":"fake-id","status":"COMPLETED","amount":99999999}'
# → Response 200 — job masuk BullMQ queue!
```

### Yang Harus Diimplementasikan

**Langkah B1 — Tambah import crypto jika belum ada:**
```typescript
import crypto from 'crypto';
```

**Langkah B2 — Rewrite fungsi `verifyWebhookSignature`:**

Logika lengkap yang harus diimplementasikan:

```
IF webhookToken adalah falsy (string kosong atau undefined):
  IF NODE_ENV === 'production':
    → THROW Error: '[XENDIT] CRITICAL: Webhook token not configured in production.
       Set XENDIT_WEBHOOK_TOKEN environment variable immediately.'
  ELSE (development/staging):
    → console.warn: '[XENDIT] ⚠️ WARNING: Webhook signature verification SKIPPED.
       Acceptable ONLY in development. Set XENDIT_WEBHOOK_TOKEN for staging/prod.'
    → return true

ELSE (webhookToken ada):
  → Gunakan crypto.timingSafeEqual() untuk perbandingan
  → JANGAN gunakan === untuk string comparison yang security-sensitive
  → Implementasi:
     const a = Buffer.from(webhookToken)
     const b = Buffer.from(incomingToken)
     if (a.length !== b.length) return false
     return crypto.timingSafeEqual(a, b)
```

**Kenapa `timingSafeEqual`?**
Perbandingan `===` rentan terhadap timing attack. Panjang waktu eksekusi `===`
bervariasi tergantung di karakter mana string mulai berbeda. `timingSafeEqual`
selalu memakan waktu yang sama terlepas dari isi string.

**Signature fungsi tidak boleh berubah:**
```typescript
export function verifyWebhookSignature(webhookToken: string, incomingToken: string): boolean
```

---

## ═══════════════════════════════════════
## TASK P1-C — Implementasi Gas Estimation Sebelum TX [Bug H-03]
## ═══════════════════════════════════════

**File:** `backend/src/services/blockchain.service.ts`

### Masalah

Fungsi `recordMerkleRoot()` dan `recordTranche()` hanya mengecek saldo dengan
threshold statis (`balance >= 0.01 MATIC`). Tidak ada estimasi gas aktual.
Jika jaringan Polygon congested dan gas price naik, TX akan revert dengan
gas fee hangus. **Ini melanggar Rule 7.**

### Yang Harus Diimplementasikan

**Untuk KEDUA fungsi (`recordMerkleRoot` dan `recordTranche`), tambahkan blok
ini SEBELUM memanggil contract function:**

**Langkah C1 — Dapatkan saldo saat ini:**
```typescript
const balance = await provider.getBalance(relayerWallet.address);
```

**Langkah C2 — Upper limit warning (dari Gemini audit):**
```typescript
if (balance > ethers.parseEther('5')) {
  console.warn(
    `[BLOCKCHAIN] ⚠️ Relayer wallet balance exceeds 5 MATIC safety limit. ` +
    `Current: ${ethers.formatEther(balance)} MATIC. ` +
    `Only keep gas money in this wallet.`
  );
}
```

**Langkah C3 — Estimasi gas aktual:**
```typescript
// Ganti 'namaFungsiContract' dengan nama fungsi yang SEBENARNYA ada di contract ABI
// Untuk recordMerkleRoot: contract.recordDailyMerkleRoot.estimateGas(merkleRoot)
// Untuk recordTranche: contract.releaseTranche.estimateGas(umkmId, trancheId, amount, aiScore)
const gasEstimate = await contract.NAMA_FUNGSI.estimateGas(PARAMS);
```

**Langkah C4 — Dapatkan fee data:**
```typescript
const feeData = await provider.getFeeData();
if (!feeData.gasPrice) {
  throw new Error('[BLOCKCHAIN] Cannot get gas price from network. Aborting TX.');
}
```

**Langkah C5 — Hitung total gas cost dan safety check:**
```typescript
const gasCost = gasEstimate * feeData.gasPrice;
if (balance < gasCost * 2n) {
  throw new Error(
    `CRITICAL: Relayer wallet balance insufficient.\n` +
    `Balance: ${ethers.formatEther(balance)} MATIC\n` +
    `Required (2x safety): ${ethers.formatEther(gasCost * 2n)} MATIC\n` +
    `Relayer address: ${relayerWallet.address}\n` +
    `Action: Top up relayer wallet immediately.`
  );
}
```

**Langkah C6 — Baru kirim TX:**
Setelah semua check di atas lulus, lanjutkan dengan pemanggilan contract yang sudah ada.

**CATATAN PENTING:**
Jika nama fungsi di contract ABI tidak pasti, nyatakan asumsi dengan format:
```
⚠️ ASUMSI: Nama fungsi contract adalah 'recordDailyMerkleRoot'.
Verifikasi dengan ABI di artifacts/ atau kontrak yang di-deploy.
```

**Jangan ubah:**
- Signature fungsi `recordMerkleRoot()` dan `recordTranche()`
- Logika pengiriman TX itu sendiri
- Return type kedua fungsi

---

## ═══════════════════════════════════════
## TASK P1-D — Redlock + Server Startup Catch-up Job [Bug NEW]
## ═══════════════════════════════════════

**Files:**
- `backend/src/server.ts` (modifikasi)
- `backend/src/workers/merkle.worker.ts` (modifikasi)

### Masalah A — Tidak Ada Distributed Lock

Cron job Merkle batching di `merkle.worker.ts` tidak memiliki distributed lock.
Jika dua instance backend berjalan bersamaan (scale-out), keduanya akan mencoba
menulis Merkle Root untuk hari yang sama. Smart contract akan revert pada TX kedua
(karena immutability guard), tapi MATIC tetap hangus dan job gagal tercatat.

### Masalah B — Tidak Ada Recovery Saat Server Down

Jika server mati tepat saat cron job seharusnya berjalan (23:59), semua transaksi
hari itu akan tertinggal dengan status `PENDING` atau `BATCHING` selamanya.

### Yang Harus Diimplementasikan

#### D1 — Inisialisasi Redlock di `server.ts`

**Cek package.json** — apakah `redlock` sudah ada sebagai dependency?
- Jika sudah ada: lanjutkan
- Jika belum: nyatakan dengan:
  ```
  ⚠️ DEPENDENCY MISSING: jalankan npm install redlock sebelum melanjutkan
  ```

Import dan inisialisasi menggunakan Redis client yang sudah ada:
```typescript
import Redlock from 'redlock';

// Gunakan Redis client yang sudah ada di aplikasi (biasanya sudah ada sebagai redisClient)
const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 0,      // INTENTIONAL: jangan retry — jika terkunci, instance lain sedang proses
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500,
});
```

**Kenapa `retryCount: 0`?**
Jika instance lain sudah pegang lock, kita TIDAK mau race condition. Skip saja.
Log bahwa instance ini skip, dan biarkan yang sudah pegang lock yang menyelesaikan.

#### D2 — Wrap Cron Job dengan Redlock di `merkle.worker.ts`

Temukan di mana cron job dijadwalkan (kemungkinan menggunakan `node-cron` atau
`bull` repeatable job). Wrap eksekusinya dengan pattern berikut:

```
KETIKA cron job 23:59 dipanggil:
  1. Coba acquire lock dengan key: 'nemos:merkle-batch-lock'
     Duration lock: 300000ms (5 menit)
  2. Jika lock GAGAL didapat (instance lain sudah punya):
     → Log: '[MERKLE] Cron skipped — another instance holds the batch lock'
     → Return tanpa memproses apapun
  3. Jika lock BERHASIL didapat:
     → Jalankan logika batch yang sudah ada
     → Di dalam finally block: release lock
     → Pastikan release ada di finally, bukan hanya di happy path
```

Implementasi try-finally untuk lock release:
```typescript
let lock;
try {
  lock = await redlock.acquire(['nemos:merkle-batch-lock'], 300000);
  // ... jalankan batch logic ...
} catch (err) {
  if (err.name === 'ExecutionError') {
    // Lock tidak bisa didapat — instance lain sedang proses
    console.log('[MERKLE] Cron skipped — another instance holds the batch lock');
    return;
  }
  throw err; // Error lain — re-throw
} finally {
  if (lock) await lock.release().catch(console.error);
}
```

#### D3 — Catch-up Job di `server.ts`

Buat fungsi `runStartupCatchup()` yang dipanggil **satu kali** saat server startup,
**setelah** koneksi database terkonfirmasi dan **sebelum** `app.listen()`.

Fungsi ini harus:

```
LANGKAH 1 — Query transaksi yang tertinggal:
  Cari semua Transaction di Prisma dimana:
    status IN ['PENDING', 'BATCHING']
    AND createdAt < awal hari ini (UTC midnight)
  
  Cara mendapatkan UTC midnight hari ini:
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // where: { createdAt: { lt: today } }

LANGKAH 2 — Jika tidak ada transaksi tertinggal:
  Log: '[STARTUP] No missed transactions found. Catch-up not needed.'
  Return.

LANGKAH 3 — Jika ada transaksi tertinggal:
  Log: '[STARTUP] Found N missed transactions from previous days. 
        Initiating catch-up Merkle batch...'
  
  Group transaksi berdasarkan tanggal (YYYY-MM-DD dari createdAt)

LANGKAH 4 — Untuk setiap kelompok tanggal:
  Tambahkan job ke BullMQ Merkle queue:
    Nama job: 'catch-up-merkle-batch'
    Data: { transactionIds: [...], date: 'YYYY-MM-DD' }
  
  Gunakan queue instance yang sudah ada (jangan buat queue baru)

LANGKAH 5 — Log hasil:
  '[STARTUP] Catch-up jobs queued for dates: [list tanggal]'
```

**KRITIS — Error handling:**
```typescript
// Catch-up TIDAK BOLEH menghentikan server dari start
try {
  await runStartupCatchup();
} catch (err) {
  console.error('[STARTUP] Catch-up job failed — server will continue:', err);
  // Jangan throw — server harus tetap start
}
```

**Posisi pemanggilan di `server.ts`:**
```
connect database
  → [setelah sukses] run startup catchup (dengan try-catch)
  → app.listen(PORT)
```

---

## ════════════════════════════════════════
## DELIVERABLE P1 — FORMAT OUTPUT
## ════════════════════════════════════════

Urutan file yang harus di-output:
1. `backend/src/config/env.ts` — complete file
2. `backend/src/services/xendit.service.ts` — complete file
3. `backend/src/services/blockchain.service.ts` — complete file
4. `backend/src/workers/merkle.worker.ts` — complete file
5. `backend/src/server.ts` — complete file

Untuk setiap file, sertakan self-audit:

```
SELF-AUDIT P1-[A/B/C/D] — [nama file]

Rule 7 (Relayer Safety):
  [✓/✗] Balance check ada
  [✓/✗] estimateGas() dipanggil sebelum TX
  [✓/✗] getFeeData() dipanggil
  [✓/✗] 2x safety buffer check ada
  [✓/✗] Upper 5 MATIC warning ada
  [N/A] Jika file ini tidak menyentuh blockchain

Rule 8 (Env Validation):
  [✓/✗] POLYGON_AMOY_RPC ada di requiredEnvVars
  [✓/✗] RELAYER_PRIVATE_KEY ada di requiredEnvVars
  [N/A] Jika bukan file env.ts

Security:
  [✓/✗] Webhook tidak bisa bypass di production
  [✓/✗] timingSafeEqual digunakan (bukan ===)

Reliability:
  [✓/✗] Redlock diimplementasikan
  [✓/✗] retryCount: 0 (intentional)
  [✓/✗] Lock release ada di finally block
  [✓/✗] Catch-up job error tidak mencegah server start

Assumptions made:
  - [list atau "Tidak ada"]

Dependencies baru yang dibutuhkan:
  - [list npm install commands, atau "Tidak ada"]

RESULT: ✅ PASS / ❌ BLOCKED — [alasan]
```

---

## ════════════════════════════════════════
## SETELAH P1 SELESAI — VERIFIKASI MANUAL
## ════════════════════════════════════════

### Checklist Verifikasi P1

**Test H-01 — Required env vars:**
- [ ] Hapus sementara `POLYGON_AMOY_RPC` dari `.env`
- [ ] Jalankan `npm run dev` di backend
- [ ] **Expected:** Server crash dengan pesan eksplisit menyebutkan `POLYGON_AMOY_RPC`
- [ ] **BUKAN:** Server start tanpa error dan gagal diam-diam kemudian
- [ ] Kembalikan env var setelah test

**Test H-02 — Webhook signature:**
- [ ] Dengan `XENDIT_WEBHOOK_TOKEN` kosong di dev, kirim fake webhook:
  ```bash
  curl -X POST http://localhost:4000/api/webhooks/xendit \
    -H "Content-Type: application/json" \
    -d '{"id":"fake","status":"COMPLETED","amount":100}'
  ```
- [ ] **Expected:** Console menampilkan warning tapi request masih diproses (dev mode)
- [ ] Set `NODE_ENV=production` sementara, ulangi:
- [ ] **Expected:** Error dilempar, request ditolak

**Test H-03 — Gas estimation:**
- [ ] Periksa log saat `recordMerkleRoot` dipanggil
- [ ] **Expected:** Log menampilkan balance dan estimated gas sebelum TX
- [ ] Simulasikan insufficient balance (mock atau gunakan wallet kosong di test env)
- [ ] **Expected:** Error message spesifik dengan balance actual dan required

**Test Redlock:**
- [ ] Tidak ada cara mudah untuk test ini di dev tanpa multi-instance
- [ ] Verifikasi visual: cek kode di `merkle.worker.ts` bahwa lock acquisition ada
- [ ] Verifikasi: `retryCount: 0` ada di konfigurasi Redlock

**Test Catch-up Job:**
- [ ] Insert manual sebuah Transaction dengan `status: 'PENDING'` dan `createdAt` kemarin
  (via Prisma Studio atau raw SQL)
- [ ] Restart backend server
- [ ] **Expected:** Log menampilkan "[STARTUP] Found 1 missed transactions..."
- [ ] **Expected:** Job masuk ke BullMQ Merkle queue (cek via Bull Dashboard jika ada)

### Commit setelah verifikasi lulus:
```bash
git add backend/src/config/env.ts
git commit -m "fix(env): add RELAYER_PRIVATE_KEY and POLYGON_AMOY_RPC to required vars [H-01]"

git add backend/src/services/xendit.service.ts
git commit -m "fix(webhook): enforce signature check with timingSafeEqual and NODE_ENV guard [H-02]"

git add backend/src/services/blockchain.service.ts
git commit -m "fix(blockchain): implement estimateGas + upper limit warning before TX [H-03]"

git add backend/src/workers/merkle.worker.ts backend/src/server.ts
git commit -m "feat(reliability): add redlock distributed lock + startup catch-up job"
```

---

**Setelah semua commit di atas dilakukan dan verifikasi lulus → Lanjut ke SPRINT6_P2_MEDIUM.md**
