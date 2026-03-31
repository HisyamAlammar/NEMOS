# 🌊 NEMOS — Impact Investing Platform

> Bank Indonesia Hackathon 2026 — Fiat-to-Chain Architecture

[![Polygon](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247E5?logo=polygon)](https://amoy.polygonscan.com/address/0x1aa24060c4Cc855b8437DBA3b592647C43c87012)
[![Contract](https://img.shields.io/badge/Contract-Verified-00C853)](https://amoy.polygonscan.com/address/0x1aa24060c4Cc855b8437DBA3b592647C43c87012#code)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs)](https://nodejs.org/)

---

## 📋 Deskripsi

**NEMOS** adalah platform impact investing yang menghubungkan investor mikro dengan UMKM melalui mekanisme **Revenue-Based Financing (RBF)**. Platform ini menggunakan arsitektur **Fiat-to-Chain**: pembayaran menggunakan Rupiah (via Xendit), sementara Polygon blockchain digunakan sebagai **immutable audit trail** (bukan untuk menyimpan uang kripto).

### 3 Magic Moments (Demo Juri)

| # | Moment | Deskripsi |
|---|---|---|
| 1 | **Investment Gate** | User HARUS menyelesaikan kurikulum literasi keuangan (100%) sebelum bisa invest — diblokir di level API, bukan hanya UI |
| 2 | **QRIS Payment** | Pembayaran via QRIS Xendit, real-time webhook notification |
| 3 | **Polygonscan Proof** | Merkle root harian tercatat on-chain, bisa diverifikasi publik |

---

## 🏗️ Arsitektur

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend API    │────▶│  PostgreSQL  │
│  React/Vite  │     │  Express + TS    │     │   (Neon)     │
└─────────────┘     └────────┬─────────┘     └──────────────┘
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
              ┌──────────┐ ┌──────┐ ┌─────────────┐
              │  Xendit   │ │Redis │ │  Polygon    │
              │ (Payment) │ │(Bull)│ │  (Ledger)   │
              └──────────┘ └──────┘ └─────────────┘
```

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | React + Vite | UI/UX investor & UMKM |
| Backend | Express + TypeScript | API, auth, business logic |
| Database | PostgreSQL (Neon) | Data utama |
| Queue | Redis (Upstash) + BullMQ | Async payment processing |
| Payment | Xendit | QRIS, VA, webhook |
| Blockchain | Solidity (Hardhat) + Polygon | Immutable audit trail |
| AI | FastAPI + Gemini Vision | Receipt verification (Sprint 3) |

---

## 📂 Struktur Proyek

```
NEMOS/
├── src/                    # Frontend React/Vite
│   ├── pages/
│   ├── components/
│   └── constants/
│
├── backend/                # Backend API
│   ├── prisma/
│   │   └── schema.prisma   # 6 models, 7 enums
│   ├── src/
│   │   ├── config/env.ts   # Env validation (Rule 8)
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── investmentGate.ts  ← Magic Moment 1
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── invest.routes.ts
│   │   │   └── webhook.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── xendit.service.ts  ← Rule 3: ONLY Xendit
│   │   │   ├── queue.service.ts   ← Rule 3: ONLY BullMQ
│   │   │   └── prisma.service.ts
│   │   ├── workers/
│   │   │   └── payment.worker.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── .env.example
│
├── blockchain/             # Smart Contract
│   ├── contracts/
│   │   └── NemosEscrowLedger.sol
│   ├── test/
│   │   └── NemosEscrowLedger.test.ts
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── testDeploy.ts
│   ├── deployments/
│   │   └── amoy.json       # Deployed contract info
│   ├── hardhat.config.ts
│   └── .env.example
│
├── NEMOS_AGENT_SYSTEM_PROMPT.md  # Engineering rules
├── NEMOS_TECHNICAL_BRIEF.md      # Architecture doc
└── README.md                     # ← Kamu di sini
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- Akun gratis di: [Neon](https://neon.tech), [Upstash](https://upstash.com), [Xendit](https://xendit.co)

### 1. Clone & Install

```bash
git clone https://github.com/HisyamAlammar/NEMOS.git
cd NEMOS

# Frontend
npm install

# Backend
cd backend
npm install
cd ..

# Blockchain (opsional, sudah di-deploy)
cd blockchain
npm install
cd ..
```

### 2. Setup Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — isi credentials Neon, Upstash, Xendit

# Blockchain (opsional)
cp blockchain/.env.example blockchain/.env
# Edit blockchain/.env — isi Alchemy + Polygonscan key
```

#### Backend `.env` yang harus diisi:

| Variable | Dari mana | Contoh |
|---|---|---|
| `DATABASE_URL` | Neon Dashboard → Connection Details | `postgresql://user:pass@ep-xxx.neon.tech/nemos?sslmode=require` |
| `REDIS_URL` | Upstash Console → Database Details | `rediss://default:xxx@apn1-xxx.upstash.io:6379` |
| `JWT_SECRET` | Generate sendiri (min 32 chars) | `my-super-secret-jwt-key-32chars` |
| `XENDIT_SECRET_KEY` | Xendit Dashboard → Settings → API Keys | `xnd_development_xxx` |
| `NEMOS_CONTRACT_ADDRESS` | Sudah ada | `0x1aa24060c4Cc855b8437DBA3b592647C43c87012` |

### 3. Setup Database

```bash
cd backend
npx prisma db push      # Push schema ke Neon
npx prisma generate     # Generate Prisma client
```

### 4. Run Development Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| Health Check | http://localhost:4000/api/health |

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Daftar user baru | ❌ |
| `POST` | `/api/auth/login` | Login + dapat JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ Bearer |

### Investment

| Method | Endpoint | Deskripsi | Auth | Gate |
|---|---|---|---|---|
| `POST` | `/api/invest` | Buat investasi + QRIS | ✅ Bearer | ✅ learningProgress = 100 |

### Webhook

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/webhooks/xendit` | Callback dari Xendit |

---

## ⛓️ Smart Contract (Deployed)

| Item | Value |
|---|---|
| Contract | `NemosEscrowLedger` |
| Network | Polygon Amoy Testnet (chainId: 80002) |
| Address | [`0x1aa24060c4Cc855b8437DBA3b592647C43c87012`](https://amoy.polygonscan.com/address/0x1aa24060c4Cc855b8437DBA3b592647C43c87012) |
| Verified | ✅ Source code verified |
| Tests | 29/29 passing |

---

## 📜 Engineering Rules

> Semua kontributor WAJIB membaca [`NEMOS_AGENT_SYSTEM_PROMPT.md`](./NEMOS_AGENT_SYSTEM_PROMPT.md)

| Rule | Deskripsi |
|---|---|
| **Rule 1** | Zero Halusinasi — jangan tebak, tanyakan |
| **Rule 2** | Idempotency — semua operasi finansial pakai `xenditId` sebagai key |
| **Rule 3** | Separation of Concerns — Xendit dan Blockchain TERPISAH |
| **Rule 4** | Self-Correction Checklist — audit setiap kode sebelum commit |
| **Rule 7** | Balance Check — cek saldo relayer sebelum setiap TX blockchain |
| **Rule 8** | Env Validation — semua env var divalidasi saat startup |

---

## 🗓️ Sprint Roadmap

| Sprint | Task | Status |
|---|---|---|
| **Sprint 1** | Smart Contract (NemosEscrowLedger) | ✅ Deployed + Verified |
| **Sprint 2A** | Backend Foundation + Investment Gate | ✅ Code Complete |
| **Sprint 2B** | Connect Backend ↔ Blockchain | 🔲 |
| **Sprint 3** | AI Receipt Verification (FastAPI + Gemini) | 🔲 |
| **Sprint 4** | Frontend Integration (API calls) | 🔲 |
| **Sprint 5** | Final Polish + Demo Preparation | 🔲 |

---

## 👥 Tim

| Role | Nama |
|---|---|
| Lead Developer | Abyan |
| Backend/Blockchain | Partner |

---

## 📝 Commit Convention

```
feat: fitur baru
fix: perbaikan bug
docs: dokumentasi
refactor: refaktor tanpa ubah behavior
test: tambah/ubah test
chore: maintenance (deps, config)
```

Contoh: `feat(backend): implement Investment Gate middleware`

---

## ⚠️ PENTING

1. **JANGAN commit file `.env`** — sudah ada di `.gitignore`
2. **JANGAN push private key** ke repository
3. **Selalu baca `NEMOS_AGENT_SYSTEM_PROMPT.md`** sebelum coding
4. **Selalu jalankan `npx tsc --noEmit`** sebelum commit (zero TS errors)
