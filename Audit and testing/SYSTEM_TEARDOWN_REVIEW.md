# NEMOS — System Teardown Review

> **Dokumen ini bersifat READ-ONLY AUDIT. Tidak ada kode yang diubah.**
> Disiapkan untuk keperluan debugging integrasi Frontend ↔ Backend.
> Audience: Dev 1 (Abyan), Dev 2, Claude.

---

## 1. Project Overview & Tech Stack

**NEMOS** (Nano-Enterprise Micro-investment Operating System) adalah platform investasi mikro berbasis Revenue-Based Financing (RBF) yang menghubungkan investor ritel dengan UMKM terverifikasi. Fitur utama meliputi literasi keuangan berjenjang (Investment Gate), pembayaran terintegrasi (Xendit QRIS), verifikasi omzet berbasis AI (NVIDIA NIM Mistral Vision), dan transparansi transaksi on-chain (Polygon Amoy).

### Tech Stack Matrix

| Layer | Teknologi | Lokasi Kode |
|---|---|---|
| **Frontend** | React 18 + Vite, React Router v6, Zustand (state management) | `src/` |
| **Backend API** | Express.js (TypeScript), Prisma 6 ORM | `backend/src/` |
| **Database** | PostgreSQL (Neon Serverless) | `backend/prisma/schema.prisma` |
| **Queue** | BullMQ + Redis (Upstash) via ioredis | `backend/src/services/queue.service.ts` |
| **AI Microservice** | Python FastAPI, OpenAI SDK → NVIDIA NIM endpoint | `ai-service/` |
| **AI Model** | `mistralai/mistral-large-3-675b-instruct-2512` (Vision) | `ai-service/services/gemini_service.py` |
| **Blockchain** | Polygon Amoy (testnet), ethers.js v6 | `backend/src/services/blockchain.service.ts` |
| **Payment Gateway** | Xendit QRIS API (v2022-07-31) | `backend/src/services/xendit.service.ts` |
| **Smart Contract** | `NemosEscrowLedger` at `0x1aa24060c4Cc855b8437DBA3b592647C43c87012` | `blockchain/` |

### Konfigurasi Port

| Service | Port | Base URL |
|---|---|---|
| Frontend (Vite) | `5173` | `http://localhost:5173` |
| Backend (Express) | `4000` | `http://localhost:4000/api` |
| AI Service (Uvicorn) | `8000` | `http://localhost:8000` |

### Environment Variable yang Wajib (Backend)

Divalidasi di `backend/src/config/env.ts` — server **crash** jika ada yang kosong:

```
DATABASE_URL, REDIS_URL, JWT_SECRET, XENDIT_SECRET_KEY,
NEMOS_CONTRACT_ADDRESS, POLYGON_AMOY_RPC, RELAYER_PRIVATE_KEY,
XENDIT_WEBHOOK_TOKEN, ADMIN_INTERNAL_SECRET
```

---

## 2. State Management & Authentication Flow

### 2.1 Frontend State Management (Zustand)

File: `src/stores/auth.store.js`

Store menggunakan `zustand/persist` dengan localStorage key `nemos-auth-storage`.

**State yang di-persist:**

```json
{
  "state": {
    "user": {
      "id": "cuid...",
      "email": "user@email.com",
      "name": "User Name",
      "role": "INVESTOR",
      "tier": "FREE",
      "learningProgress": 0,
      "createdAt": "2026-..."
    },
    "token": "eyJhbG..."
  }
}
```

**Computed getters krusial:**

```javascript
// Menentukan apakah UI investasi terbuka
get canInvest() {
  return user?.role === 'INVESTOR' && user?.learningProgress >= 100;
}
```

### 2.2 Auth Flow: Register

```
[React Register Page]
    │
    ├─ POST /api/auth/register
    │   Body: { email, password, name, role }
    │
    └─ [Backend auth.routes.ts]
        ├─ Input validation (email regex, password length, role enum)
        ├─ auth.service.ts → registerUser()
        │   ├─ Check email unique via Prisma
        │   ├─ bcrypt.hash(password, 12)
        │   ├─ prisma.user.create()
        │   └─ jwt.sign({ userId, email, role, tier, learningProgress })
        │
        └─ Response:
```

```json
{
  "message": "Registrasi berhasil",
  "data": {
    "user": { "id", "email", "name", "role", "tier", "learningProgress", "createdAt" },
    "token": "eyJhbG..."
  }
}
```

**Zustand store menyimpan:** `response.data.user` dan `response.data.token`.

### 2.3 Auth Flow: Login

Identik dengan Register, endpoint `POST /api/auth/login`, body `{ email, password }`.

Response format sama. Store dipopulate identik.

### 2.4 Auth Flow: JWT Verification (Middleware)

File: `backend/src/middleware/auth.ts`

```
Request masuk
    │
    ├─ Extract Authorization: "Bearer <token>"
    ├─ jwt.verify(token, JWT_SECRET)
    └─ Attach ke req.user:
        {
          userId: string,
          email: string,
          role: string,
          tier: string || "FREE",
          learningProgress: number || 0
        }
```

### 2.5 Token Storage: Frontend Side

File: `src/lib/api.js`

Token **TIDAK** diambil dari Zustand store secara langsung (menghindari circular dependency). Diambil dari **localStorage** secara manual:

```javascript
function getAuthToken() {
  const authStorage = localStorage.getItem('nemos-auth-storage');
  const parsed = JSON.parse(authStorage);
  return parsed?.state?.token || null;
}
```

### 2.6 Investment Gate: Dual-Layer

**Layer 1 — Frontend (UX-only, bypassable):**

File: `src/components/InvestmentGate.jsx`

```javascript
const learningProgress = user?.learningProgress ?? 0;
if (learningProgress < 100) { /* Tampilkan blokir UI */ }
```

Sumber data: `Zustand store → localStorage`. Bisa dimanipulasi oleh user.

**Layer 2 — Backend (Security, non-bypassable):**

File: `backend/src/middleware/investmentGate.ts`

```typescript
const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
if (user.learningProgress < 100) {
  res.status(403).json({ error: "INVESTMENT_GATE_BLOCKED", ... });
}
```

Sumber data: **Database langsung**. Tidak bergantung pada JWT atau client state.

---

## 3. Frontend-to-Backend Integration Mapping (KRUSIAL)

### 3.1 Route Prefix Configuration

File: `backend/src/app.ts`

```typescript
app.use("/api/auth", authRouter);         // Auth endpoints
app.use("/api", investRouter);            // POST /api/invest
app.use("/api/blockchain", blockchainRouter);
app.use("/api/umkm", umkmRouter);         // GET /api/umkm, GET /api/umkm/:id
app.use("/api/webhooks", webhookRouter);   // POST /api/webhooks/xendit
```

File: `src/lib/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const AI_BASE_URL  = import.meta.env.VITE_AI_URL  || 'http://localhost:8000';
```

### 3.2 Mapping per Halaman/Fitur

---

#### 📄 Halaman Login (`/login`)

| Frontend | Backend |
|---|---|
| File: `src/pages/Login.jsx` | Endpoint: `POST /api/auth/login` |
| API call: `loginUser({ email, password })` via `auth.api.js` | Route: `auth.routes.ts` line 83 |
| Store update: `set({ user: response.data.user, token: response.data.token })` | Response: `{ message, data: { user, token } }` |

---

#### 📄 Halaman Register (`/register`)

| Frontend | Backend |
|---|---|
| File: `src/pages/Register.jsx` | Endpoint: `POST /api/auth/register` |
| API call: `registerUser({ email, password, name, role })` via `auth.api.js` | Route: `auth.routes.ts` line 22 |
| Store update: `set({ user: response.data.user, token: response.data.token })` | Response: `{ message, data: { user, token } }` |

---

#### 📄 Halaman UMKM Arena (`/arena`)

| Frontend | Backend |
|---|---|
| File: `src/pages/UmkmArena.jsx` | Endpoint: `GET /api/umkm` |
| API call: `fetchUmkmList()` via `umkm.api.js` | Route: `umkm.routes.ts` line 16 |
| Fallback: `DEMO_UMKM_LIST` (hardcoded) jika API null | Auth: None (public) |

**Backend response (serialized):**

```json
{
  "status": "ok",
  "data": [
    {
      "id": "cm...",
      "name": "Kedai Kopi",
      "location": "Yogyakarta",
      "category": "Kuliner",
      "grade": "A",
      "target": 40000000,
      "current": 35200000,
      "rbfRate": 5,
      "description": "...",
      "imageUrl": null,
      "ownerName": "Bapak Ilham",
      "investorCount": 3,
      "fundedPercent": 88
    }
  ],
  "count": 6
}
```

**Frontend transformation (line 230-246):**

```javascript
const apiData = response.data.map((u) => ({
  id: u.id,
  name: u.name,
  location: u.location,
  grade: u.grade,
  risk: GRADE_RISK[u.grade],
  match: Math.round(70 + Math.random() * 25), // ⚠️ Random setiap render!
  funded: u.fundedPercent,
  target: Number(u.target).toLocaleString('id-ID'),
  current: Number(u.current).toLocaleString('id-ID'),
  impact: u.description || 'Memberdayakan UMKM Indonesia',
  min: u.grade === 'C' ? '100.000' : '1.000.000',
  img: u.imageUrl || getUmkmImage(u.name, 600, 338),
  owner: u.ownerName,
  ownerImg: `https://i.pravatar.cc/150?u=${u.id}`,
  category: u.category,
}));
```

---

#### 📄 Halaman UMKM Detail (`/detail/:id`)

| Frontend | Backend |
|---|---|
| File: `src/pages/UmkmDetail.jsx` | Endpoint: `GET /api/umkm/:id` |
| API call: `fetchUmkmDetail(id)` via `umkm.api.js` | Route: `umkm.routes.ts` line 65 |
| Fallback: `DEMO_UMKM_DATA[id]` (hardcoded) | Auth: None (public) |

**Backend response:**

```json
{
  "status": "ok",
  "data": {
    "id": "cm...",
    "name": "...",
    "location": "...",
    "grade": "A",
    "target": 40000000,
    "current": 35200000,
    "rbfRate": 5,
    "description": "...",
    "imageUrl": null,
    "ownerName": "...",
    "ownerYears": 3,
    "investorCount": 5,
    "fundedPercent": 88,
    "latestTxHash": "0xabc...",
    "createdAt": "2026-..."
  }
}
```

**Frontend merge logic (line 175-186):**

```javascript
setD({
  ...demoFallback,           // Demo fields as base
  name: api.name,            // API fields override
  location: api.location,
  grade: api.grade,
  target: api.target,
  current: api.current,
  rbf: api.rbfRate,          // ⚠️ RENAME: backend "rbfRate" → frontend "rbf"
  owner: api.ownerName,      // ⚠️ RENAME: backend "ownerName" → frontend "owner"
  ownerYears: api.ownerYears,
  latestTxHash: api.latestTxHash,
});
```

---

#### 📄 Investasi: POST /api/invest

| Frontend | Backend |
|---|---|
| File: `src/pages/UmkmDetail.jsx` line 143 | Endpoint: `POST /api/invest` |
| API call: `createInvestment(umkmId, amount)` via `invest.api.js` | Route: `invest.routes.ts` |
| Body: `{ umkmId, amount }` | Middleware chain: `authMiddleware → investmentGateMiddleware → handler` |

**Backend response (success):**

```json
{
  "message": "Investasi berhasil dibuat. Silakan lakukan pembayaran.",
  "data": {
    "investmentId": "cm...",
    "payment": {
      "qrString": "000201010...",
      "amount": 1000000,
      "expiresAt": "2026-04-03T..."
    },
    "umkm": {
      "id": "cm...",
      "name": "Kedai Kopi Senja"
    }
  }
}
```

**Frontend handling (line 155-158):**

```javascript
const response = await createInvestment(d.id || id, investValue);
setPaymentData(response.data.payment);    // { qrString, amount, expiresAt }
setShowPaymentModal(true);
```

---

#### 📄 Upgrade Tier: POST /api/auth/upgrade-tier

| Frontend | Backend |
|---|---|
| File: `src/components/UpgradeModal.jsx` | Endpoint: `POST /api/auth/upgrade-tier` |
| API call: `upgradeToPremium()` via `invest.api.js` | Route: `auth.routes.ts` line 139 |
| Body: `{ tier: 'PREMIUM' }` | ⚠️ Backend IGNORES body.tier |

**Backend response:**

```json
{
  "message": "Upgrade ke Premium berhasil! Silakan selesaikan pembayaran.",
  "data": {
    "user": { "id", "email", "name", "role", "tier": "PREMIUM", "learningProgress" },
    "payment": {
      "qrString": "...",
      "amount": 99000,
      "expiresAt": "..."
    }
  }
}
```

**Frontend post-upgrade (line 28-33):**

```javascript
const response = await upgradeToPremium();
await refreshUser();                       // GET /api/auth/me → re-sync Zustand
onSuccess?.(response.data);
```

---

#### 📄 AI OCR: POST /ocr/verify-receipt

| Frontend | AI Service |
|---|---|
| File: (Tidak ada UI call langsung; didesain untuk backend-to-service call) | Endpoint: `POST http://localhost:8000/ocr/verify-receipt` |
| `aiFetch('/ocr/verify-receipt', ...)` tersedia di `api.js` | Route: `ai-service/routers/ocr.py` |
| Content-Type: `multipart/form-data` | File field: `receipt` |

**AI Service response:**

```json
{
  "confidence": 92,
  "extracted": {
    "date": "2026-03-15",
    "total": 850000,
    "merchant": "Dapur Nusantara"
  },
  "status": "VERIFIED",
  "flagged_for_manual": false
}
```

---

#### 📄 LearnHub (`/learn`)

- **Sepenuhnya client-side.** Tidak ada API call ke backend.
- 7 modul hardcoded di `LESSONS` array.
- `learningProgress` hanya di-update secara lokal via `updateLearningProgress()` di Zustand store.
- **Tidak ada endpoint backend untuk persistensi progress.** (Lihat Sec 5, Bug Hypothesis #1)

---

#### 📄 UMKM Dashboard (`/umkm-dashboard`)

- **Sepenuhnya client-side.** Semua data (127 investor, 75% terkumpul, transaksi) adalah **hardcoded.**
- "Video Verification" adalah **Wizard of Oz** — simulasi UI tanpa API call.
- Transaksi cash reconciliation form menyimpan state di React state lokal, **tidak persisted ke backend.**

---

## 4. The Core Journeys (Step-by-Step Logic)

### 4.1 Alur Investasi (Xendit QRIS) — End to End

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React / UmkmDetail.jsx)                       │
│                                                                             │
│  1. User klik "Konfirmasi Pendanaan" → handleInvest()                      │
│  2. Cek isAuthenticated (dari Zustand token) — if not, toast error         │
│  3. Cek investValue >= 100000 — if not, toast error                        │
│  4. createInvestment(umkmId, amount) →                                      │
│     apiFetch('/invest', { method: 'POST', body: { umkmId, amount } })      │
│     Headers: Authorization: Bearer <JWT dari localStorage>                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express / invest.routes.ts)                      │
│                                                                             │
│  5. authMiddleware                                                          │
│     ├─ Extract JWT token dari Authorization header                          │
│     ├─ jwt.verify(token, JWT_SECRET)                                        │
│     └─ Attach req.user = { userId, email, role, tier, learningProgress }    │
│                                                                             │
│  6. investmentGateMiddleware                                                │
│     ├─ prisma.user.findUnique({ id: req.user.userId })                      │
│     ├─ Cek: user.role !== "INVESTOR" → 403 FORBIDDEN                       │
│     └─ Cek: user.learningProgress < 100 → 403 INVESTMENT_GATE_BLOCKED      │
│                                                                             │
│  7. Handler                                                                 │
│     ├─ Input validation: umkmId dan amount wajib ada                        │
│     ├─ Amount validation: Number(amount) >= 100_000                         │
│     │                                                                       │
│     ├─ prisma.uMKM.findUnique({ id: umkmId }) → cek UMKM exist             │
│     ├─ Cek remaining = target - current → amount <= remaining               │
│     ├─ Cek tier: grade !== "C" && tier === "FREE" → 403 TIER_RESTRICTED     │
│     │                                                                       │
│     ├─ ═══ ATOMIC DB TRANSACTION ($transaction) ═══                         │
│     │   ├─ investment.create({ amount, userId, umkmId, xenditTxId, PENDING})│
│     │   └─ transaction.create({ xenditId, INVESTMENT, amount, PENDING })    │
│     │                                                                       │
│     ├─ createQrisPayment({ externalId, amount, description })               │
│     │   ├─ POST https://api.xendit.co/qr_codes                             │
│     │   └─ Returns: { qrString, externalId, amount, status, expiresAt }    │
│     │                                                                       │
│     └─ Response 201: { investmentId, payment: { qrString, amount,          │
│                         expiresAt }, umkm: { id, name } }                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               FRONTEND — PaymentModal.jsx                                   │
│                                                                             │
│  8. setPaymentData(response.data.payment)                                   │
│  9. setShowPaymentModal(true)                                               │
│  10. PaymentModal menampilkan: QRIS code, amount, countdown timer           │
│  11. User scan QR → bayar melalui e-wallet                                 │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ (Xendit mengirim callback)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               WEBHOOK (webhook.routes.ts)                                   │
│                                                                             │
│  12. POST /api/webhooks/xendit                                              │
│      ├─ Parse body (Buffer → JSON)                                          │
│      ├─ verifyWebhookSignature(env.XENDIT_WEBHOOK_TOKEN, x-callback-token)  │
│      ├─ Extract: xenditId, externalId, amount, status                       │
│      │                                                                      │
│      ├─ IDEMPOTENCY: prisma.transaction.findUnique({ xenditId })            │
│      │   └─ Jika status !== "PENDING" → return 200 (already processed)     │
│      │                                                                      │
│      ├─ if status ∈ ["COMPLETED","PAID","SUCCEEDED"]:                       │
│      │   enqueuePaymentJob({ xenditId, externalId, amount, type })          │
│      │   └─ BullMQ queue "nemos-payment", jobId: "payment-<xenditId>"       │
│      │                                                                      │
│      └─ Return 200 segera (Xendit expects fast response)                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               PAYMENT WORKER (payment.worker.ts)                            │
│                                                                             │
│  13. Worker consume job dari queue "nemos-payment"                           │
│      ├─ Idempotency check (belt-and-suspenders): jika CONFIRMED → skip      │
│      │                                                                      │
│      ├─ ═══ ATOMIC DB TRANSACTION ($transaction) ═══                        │
│      │   ├─ transaction.upsert({ xenditId }) → status: CONFIRMED            │
│      │   ├─ investment.findUnique({ xenditTxId: externalId })               │
│      │   │   ⚠️ KEY: lookup via externalId, NOT xenditId                     │
│      │   ├─ transaction.update → link investId                              │
│      │   ├─ investment.update → status: ACTIVE                              │
│      │   ├─ uMKM.update → current: { increment: amount }                   │
│      │   └─ tranche.create → stage: 1, amount: 60% of total, aiVerified: ✗ │
│      │                                                                      │
│      └─ Logging: TX ID, Investment ID, UMKM name, Amount                   │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ (Daily cron at 23:59 WIB / 16:59 UTC)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               MERKLE WORKER (merkle.worker.ts)                              │
│                                                                             │
│  14. Daily batch: query PENDING/BATCHING transactions dari hari ini         │
│      ├─ Acquire Redlock to prevent dual-instance processing                 │
│      ├─ Mark all as BATCHING                                                │
│      ├─ Compute Merkle root from SHA-256 leaf hashes                        │
│      ├─ recordMerkleRoot(dayNumber, merkleRoot, txCount) → Polygon Amoy     │
│      │   ├─ Rule 7: relayerSafetyCheck()                                    │
│      │   │   ├─ getBalance()                                                │
│      │   │   ├─ estimateGas()                                               │
│      │   │   ├─ getFeeData()                                                │
│      │   │   └─ Reject if balance < gasCost * 2                             │
│      │   └─ contract.recordDailyMerkleRoot(dayNumber, merkleRoot, txCount)  │
│      │                                                                      │
│      └─ Update all transactions: CONFIRMED, merkleRoot, merkleLeaf, txHash  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Alur AI OCR Verification (Mistral Vision) — End to End

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          CALLER (Backend internal / Direct API test)                        │
│                                                                             │
│  1. POST http://localhost:8000/ocr/verify-receipt                           │
│     Content-Type: multipart/form-data                                       │
│     Field: receipt = <gambar_struk.jpg>                                      │
│                                                                             │
│  ⚠️ CATATAN: Tidak ada halaman frontend yang melakukan call ini.            │
│  Frontend UMKM Dashboard menggunakan Wizard-of-Oz simulation (hardcoded).  │
│  aiFetch() tersedia di src/lib/api.js tapi belum dipakai oleh halaman     │
│  manapun.                                                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│          AI SERVICE (FastAPI / routers/ocr.py)                               │
│                                                                             │
│  2. Validate file type ∈ { image/jpeg, image/png, image/webp, image/heic } │
│  3. Read image bytes, validate size <= 10MB, not empty                       │
│  4. Call analyze_receipt(image_bytes, content_type)                          │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│          GEMINI SERVICE (services/gemini_service.py)                         │
│                                                                             │
│  5. Encode image to base64                                                  │
│     image_url = f"data:{content_type};base64,{b64_image}"                  │
│                                                                             │
│  6. Build OpenAI-compatible VLM payload:                                    │
│     messages = [                                                            │
│       { role: "system", content: SYSTEM_PROMPT },                           │
│       { role: "user", content: [                                            │
│           { type: "image_url", image_url: { url: image_url } },             │
│           { type: "text", text: RECEIPT_ANALYSIS_PROMPT }                   │
│       ]}                                                                    │
│     ]                                                                       │
│                                                                             │
│  7. POST to https://integrate.api.nvidia.com/v1/chat/completions            │
│     model: "mistralai/mistral-large-3-675b-instruct-2512"                   │
│     temperature: 0.15, max_tokens: 2048                                     │
│                                                                             │
│  8. Parse JSON response (with markdown-stripping fallback)                  │
│     Return: { date, total, merchant, confidence }                           │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│          OCR ROUTER — Business Rules                                        │
│                                                                             │
│  9. if confidence >= 85:                                                    │
│       status = "VERIFIED", flagged_for_manual = false                       │
│     else:                                                                   │
│       status = "NEEDS_REVIEW", flagged_for_manual = true                    │
│                                                                             │
│  10. Return ReceiptVerifyResponse:                                          │
│      { confidence, extracted: { date, total, merchant },                    │
│        status, flagged_for_manual }                                         │
│                                                                             │
│  ⚠️ CATATAN: TIDAK ADA persistensi ke database dari AI service.            │
│  Dengan desain saat ini, hasil OCR tidak disimpan. Backend harus memanggil │
│  AI service dan menyimpan hasilnya sendiri ke tabel Tranche.               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Identifikasi Potensi "Disconnect" — Hipotesis Bug

Berdasarkan pembacaan kode secara menyeluruh, berikut adalah hipotesis ketidakcocokan yang berpotensi menyebabkan bug integrasi:

---

### 🔴 BUG-H1: learningProgress Tidak Pernah Persisted ke Backend

**Severity: CRITICAL — Merusak core Investment Gate flow**

**Temuan:**
- `LearnHub.jsx` mendefinisikan 7 modul edukasi, tetapi **tidak ada API call** yang mempersistensikan progress ke database.
- Zustand store memiliki `updateLearningProgress(progress)` yang hanya mengupdate `localStorage`.
- `investmentGateMiddleware` di backend membaca `learningProgress` dari **database** (`prisma.user.findUnique`).
- Karena `learningProgress` di database selalu `0` (default dari register), **user tidak akan pernah bisa melewati Investment Gate di backend**.

**Dampak:** Setelah user menyelesaikan semua 7 modul di LearnHub, mereka akan melihat tombol "Konfirmasi Pendanaan" (karena Zustand state lokal = 100), tetapi saat diklik, backend akan selalu mengembalikan **403 INVESTMENT_GATE_BLOCKED**.

**Root cause:** Tidak ada endpoint `POST /api/auth/update-progress` atau `PATCH /api/auth/me` yang akan mengupdate `learningProgress` di database.

---

### 🔴 BUG-H2: `userTier` di App.jsx adalah React State Lokal, Bukan dari Auth Store

**Severity: CRITICAL — Merusak tier-gating UX & investasi**

**Temuan:**
- `App.jsx` line 312: `const [userTier, setUserTier] = useState('premium');`
- **Default value adalah `'premium'`**, artinya semua user FREE terlihat seolah-olah PREMIUM di UI.
- `userTier` dipass sebagai prop ke `<UmkmArena>` dan `<UmkmDetail>`:
  ```jsx
  <Route path="/arena" element={<UmkmArena userTier={userTier} />} />
  <Route path="/detail/:id" element={<UmkmDetail userTier={userTier} />} />
  ```
- Tetapi `userTier` **tidak pernah di-sync** dari `useAuthStore().user?.tier`.
- Navigasi bar bahkan memiliki toggle klik yang **toggle tier secara manual** (line 63):
  ```jsx
  onClick={() => setUserTier(userTier === 'premium' ? 'free' : 'premium')}
  ```

**Dampak:** Tier yang ditampilkan di UI tidak merefleksikan tier aktual user di database. User FREE melihat akses PREMIUM di Arena cards, tetapi saat investasi di Grade A/B UMKM, backend akan menolak dengan **403 TIER_RESTRICTED**.

---

### 🟡 BUG-H3: `userRole` di App.jsx adalah React State Lokal, Bukan dari Auth Store

**Severity: HIGH — Merusak role-based routing**

**Temuan:**
- `App.jsx` line 311: `const [userRole, setUserRole] = useState('investor');`
- Terdapat `RoleSwitcher` component (floating button di kanan bawah) yang memungkinkan user **mengubah tampilan** antara `investor` dan `umkm_owner`.
- Ini **independen** dari `user.role` di Zustand auth store.

**Dampak:** Seorang UMKM_OWNER yang login akan tetap melihat tampilan Investor (karena default `'investor'`). Mereka harus klik RoleSwitcher secara manual. Sebaliknya jika user INVESTOR klik "Pengusaha UMKM", mereka akan melihat dashboard UMKM owner tapi tanpa data real.

---

### 🟡 BUG-H4: Mismatch ID Antara Demo Data dan Database IDs

**Severity: HIGH — Navigasi detail page bisa menampilkan data salah**

**Temuan:**
- `DEMO_UMKM_LIST` di `UmkmArena.jsx` menggunakan ID numerik: `0, 1, 2, 3, 4` dan string `'dapur-nusantara'`.
- Database menggunakan `cuid()` IDs (contoh: `cm1abc2def3gh`).
- Saat API berhasil, cards memiliki ID database (cuid). Tetapi saat navigasi ke detail:
  ```jsx
  onClick={() => navigate(`/detail/${umkm.id}`)}
  ```
  `UmkmDetail.jsx` melakukan:
  ```javascript
  const [d, setD] = useState(DEMO_UMKM_DATA[id] || DEMO_UMKM_DATA[0]);
  ```
  Jika `id` adalah cuid (dari API), `DEMO_UMKM_DATA[cuid]` akan menjadi `undefined`, lalu fallback ke `DEMO_UMKM_DATA[0]` (Kedai Kopi Senja).
- API detail call `fetchUmkmDetail(id)` mungkin berhasil, tapi merge logic (line 175-186) menggunakan `demoFallback` sebagai base, yang selalu fallback ke `DEMO_UMKM_DATA[0]`.

**Dampak:** Semua halaman detail UMKM dari database akan **sesaat merender** data "Kedai Kopi Senja" (demo fallback) sebelum API response datang. Dan field yang tidak ada di API response (bars, vals, story, heroImg, alloc, dll) akan **selalu** dari demo data Kedai Kopi.

---

### 🟡 BUG-H5: UpgradeModal Menampilkan Harga Rp 49.000 Tapi Backend Charge Rp 99.000

**Severity: MEDIUM — Inkonsistensi harga yang membingungkan user**

**Temuan:**
- `UpgradeModal.jsx` line 93: `<span>Rp 49.000</span>/bulan`
- `auth.routes.ts` line 165: `const PREMIUM_PRICE = 99_000;`

**Dampak:** User melihat "Rp 49.000/bulan" di modal, tetapi QRIS yang digenerate menampilkan "Rp 99.000" sebagai amount. PaymentModal akan menampilkan `paymentData.amount = 99000` yang benar dari backend, menyebabkan kebingungan harga.

---

### 🟡 BUG-H6: Upgrade Tier Langsung Update DB Tanpa Menunggu Payment

**Severity: MEDIUM — User mendapat PREMIUM tanpa bayar**

**Temuan:**
- `auth.routes.ts` line 197: `prisma.user.update({ data: { tier: "PREMIUM" } })` dilakukan **sebelum** user membayar QRIS.
- Komentar di kode: "Optimistically upgrade tier (will be confirmed by webhook). For hackathon demo, we upgrade immediately."

**Dampak:** User mendapat akses PREMIUM begitu klik "Upgrade", bahkan jika mereka tidak pernah scan QRIS. Ini adalah design decision untuk demo, bukan bug, tetapi perlu dicatat.

---

### 🟡 BUG-H7: Webhook Idempotency Lookup Mismatch

**Severity: MEDIUM — Bisa menyebabkan duplicated atau missed processing**

**Temuan:**
- Di `webhook.routes.ts`, idempotency check dilakukan via: `prisma.transaction.findUnique({ where: { xenditId } })`
- `xenditId` di webhook = `payload.id || payload.payment_id` — ini adalah **Xendit's internal ID**.
- Tetapi saat invest, `transaction.create` menggunakan: `xenditId: xenditExternalId` dimana `xenditExternalId = "nemos-inv-{timestamp}-{random}"` — ini adalah **external ID yang kita buat**.
  
- Masalah: Xendit webhook mengirim `payload.id` (Xendit internal ID, misal `"qr_abc123"`) dan `payload.external_id` (external ID kita, misal `"nemos-inv-..."`).
- Webhook menggunakan `payload.id` untuk lookup, tapi database `xenditId` berisi **external ID kita**.
- Maka `findUnique({ where: { xenditId: payload.id } })` akan **selalu return null**, karena tidak pernah cocok.

**Dampak:** Idempotency check tidak akan pernah mendeteksi "already processed". Job akan selalu di-enqueue. Namun, BullMQ memiliki deduplication via `jobId: "payment-<xenditId>"` yang mungkin menyelamatkan dari duplicate processing — tetapi hanya jika `xenditId` yang di-pass ke queue konsisten.

Di payment worker, lookup juga berpotensi mismatch:
```typescript
const investment = await tx.investment.findUnique({
  where: { xenditTxId: externalId },
});
```
Jika `externalId` dari webhook data = `payload.external_id`, ini mungkin cocok. Tapi jika `externalId` dari webhook field lain, lookup akan gagal.

---

### 🟠 BUG-H8: Frontend Tidak Melakukan Polling/WebSocket Setelah QRIS Dibuat

**Severity: LOW-MEDIUM — UX suboptimal tetapi fungsionalnya jalan**

**Temuan:**
- Setelah PaymentModal ditampilkan, tidak ada mekanisme untuk mendeteksi apakah pembayaran berhasil.
- Tidak ada polling ke endpoint `GET /api/invest/:id/status`.
- Tidak ada WebSocket/SSE connection.
- PaymentModal hanya menampilkan teks statis: "Status pembayaran akan diperbarui otomatis via webhook Xendit".
- User harus klik "Tutup — Saya Sudah Scan" secara manual.

**Dampak:** User tidak mendapat konfirmasi real-time bahwa pembayaran berhasil. Dashboard/Portfolio tidak akan ter-update sampai user melakukan refresh manual.

---

### 🟠 BUG-H9: AI OCR Tidak Terintegrasi ke Alur Tranche Release

**Severity: LOW — Feature gap, bukan crash bug**

**Temuan:**
- AI Service (`POST /ocr/verify-receipt`) berjalan standalone.
- Tidak ada panggilan dari backend Node.js ke AI service.
- `Tranche` model memiliki field `aiVerified`, `confidence`, dan `receiptUrl` — semua kosong.
- Payment worker selalu mencreate tranche 1 dengan `aiVerified: false`.
- Tidak ada endpoint/worker yang mengurus tranche 2+ (yang memerlukan AI verification).

**Dampak:** Fitur "Upload Struk → AI Verify → Tranche Release" belum terwired end-to-end. AI service dan tranche system bekerja secara terpisah.

---

### 🟠 BUG-H10: UmkmArena Menerima `userTier` Sebagai Prop, Bukan dari Auth Store

**Severity: LOW — State tidak sinkron dengan source of truth**

**Temuan:**
- `UmkmArena` menerima `userTier` sebagai prop dari `App.jsx`.
- Bersamaan, `UmkmArena` juga mengakses `useAuthStore((s) => s.user)` untuk user name.
- Tier yang digunakan untuk lock Grade A/B cards berasal dari **prop** (React state lokal di App.jsx), bukan dari `user.tier` di auth store.

**Dampak:** Setelah UpgradeModal berhasil dan `refreshUser()` mengupdate auth store (`user.tier = "PREMIUM"`), card locks di Arena **tidak akan terupdate** karena prop `userTier` di App.jsx tidak mengikuti perubahan auth store.

---

### Ringkasan Hipotesis Bug

| ID | Severity | Deskripsi Singkat |
|---|---|---|
| **BUG-H1** | 🔴 CRITICAL | `learningProgress` tidak pernah di-persist ke DB. Investment Gate selalu blokir. |
| **BUG-H2** | 🔴 CRITICAL | `userTier` di App.jsx = hardcoded `'premium'`, tidak sync dari auth store. |
| **BUG-H3** | 🟡 HIGH | `userRole` di App.jsx = React state, bukan dari auth store `user.role`. |
| **BUG-H4** | 🟡 HIGH | Mismatch ID (demo numeric vs cuid) menyebabkan detail page selalu fallback ke demo data. |
| **BUG-H5** | 🟡 MEDIUM | Harga di UI "Rp 49.000" vs backend charge "Rp 99.000". |
| **BUG-H6** | 🟡 MEDIUM | Tier upgrade tanpa menunggu payment confirmation. (Design decision for demo) |
| **BUG-H7** | 🟡 MEDIUM | Webhook idempotency lookup mismatch: `payload.id` vs `externalId` di DB. |
| **BUG-H8** | 🟠 LOW-MED | Tidak ada real-time payment status update setelah QRIS scan. |
| **BUG-H9** | 🟠 LOW | AI OCR belum terwired ke tranche release flow. |
| **BUG-H10** | 🟠 LOW | `UmkmArena` tier gating dari prop, bukan auth store; tidak react to upgrade. |

---

*Dokumen ini dihasilkan dari full codebase scan pada 2026-04-02. Tidak ada kode yang dimodifikasi selama pembuatan dokumen ini.*
