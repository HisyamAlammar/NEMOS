# NEMOS — Technical Architecture & Development Brief
### *Democratizing Impact Investment Through AI and Blockchain*

> **Dokumen ini ditujukan untuk Senior Lead Software Engineer** yang akan bergabung dalam pengembangan NEMOS.
> Baca dari awal hingga akhir agar memahami konteks bisnis, arsitektur teknis, status prototype saat ini, dan roadmap pengembangan MVP.

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Problem Statement & Solusi](#2-problem-statement--solusi)
3. [Business Model: Revenue-Based Financing (RBF)](#3-business-model-revenue-based-financing-rbf)
4. [Arsitektur Sistem: "Fiat-to-Chain"](#4-arsitektur-sistem-fiat-to-chain)
5. [Status Prototype Saat Ini](#5-status-prototype-saat-ini)
6. [Target Tech Stack MVP](#6-target-tech-stack-mvp)
7. [Data Model & Entity Relationship](#7-data-model--entity-relationship)
8. [System Flows (Sequence Diagrams)](#8-system-flows)
9. [Smart Contract Design](#9-smart-contract-design)
10. [AI Microservice Design](#10-ai-microservice-design)
11. [Sprint Roadmap](#11-sprint-roadmap)
12. [Engineering Rules of Engagement](#12-engineering-rules-of-engagement)

---

## 1. Ringkasan Eksekutif

**NEMOS** (sebelumnya bernama *FINLIT*) adalah platform **impact investing** yang menghubungkan **investor ritel** dengan **UMKM terverifikasi** menggunakan skema **Revenue-Based Financing (RBF)** — bukan utang berbunga tetap.

Platform ini bertransisi dari sebuah **prototype UI statis** (React + Vite, sudah live di Vercel) menjadi **MVP fungsional** dengan backend transaksional, smart contract on-chain, dan AI-powered verification.

**Satu kalimat:**
> *Investor membayar pakai Rupiah via QRIS/VA (Xendit), backend mencatat transaksi ke blockchain (Polygon) sebagai immutable ledger, dan AI memverifikasi penggunaan dana oleh UMKM melalui OCR struk.*

---

## 2. Problem Statement & Solusi

### Problem
Indonesia memiliki **financing gap sebesar $165B** untuk UMKM. Pinjaman bank konvensional mensyaratkan jaminan aset yang tidak dimiliki usaha mikro. Model P2P lending yang ada saat ini mengenakan bunga tetap tinggi, meningkatkan risiko kebangkrutan UMKM saat omzet turun.

### Solusi NEMOS
| Aspek | Model Lama (P2P Lending) | Model NEMOS (RBF) |
|---|---|---|
| **Skema** | Bunga tetap (flat interest) | Bagi hasil dari omzet bulanan |
| **Risiko UMKM** | Tinggi — harus bayar cicilan meski rugi | Rendah — pembayaran proporsional terhadap pendapatan |
| **Transparansi** | Terbatas | On-chain audit trail (Polygon) |
| **Verifikasi** | Manual / audit tahunan | AI OCR real-time per tranche pencairan |
| **Literasi Investor** | Tidak ada | Wajib (AI Learn Hub sebagai investment gate) |

### Differentiator Utama
1. **Investment Gate**: Investor WAJIB menyelesaikan kurikulum literasi keuangan sebelum bisa invest.
2. **On-Chain Transparency**: Setiap transaksi dicatat di Polygon sebagai Merkle Root harian.
3. **AI Receipt Verification**: Pencairan tranche ke-2+ memerlukan verifikasi struk belanja UMKM via Gemini Vision OCR.
4. **Wallet-less UX**: User tidak perlu MetaMask. Semua interaksi blockchain ditangani backend (Trusted Relayer).

---

## 3. Business Model: Revenue-Based Financing (RBF)

### Alur Bisnis End-to-End

```
Investor → Invest Rp 5.000.000 → UMKM Kedai Kopi Senja
                                        ↓
                              UMKM pakai dana untuk beli mesin roasting
                                        ↓
                              Setiap bulan, UMKM potong 5% dari omzet
                                        ↓
                              5% × Rp 10.000.000 omzet = Rp 500.000/bulan
                                        ↓
                              Investor terima bagi hasil sampai total 114-117% tercapai
                                        ↓
                              Kontrak selesai. UMKM tidak lagi memiliki kewajiban.
```

### Parameter Kunci per UMKM

| Parameter | Contoh | Keterangan |
|---|---|---|
| `Target Pendanaan` | Rp 40.000.000 | Total dana yang dicari UMKM |
| `RBF Rate` | 5%/bulan | Persentase omzet yang dipotong otomatis |
| `Estimated Return` | 14% — 17% | Proyeksi total return ke investor |
| `Grade` | A / B / C | AI-assigned credit grade |
| `Alokasi Dana` | 60% Mesin, 25% Bahan, 15% Ops | Rencana Anggaran Biaya (RAB) |
| `Tranche` | 2 tahap | Pencairan bertahap, tranche 2 butuh verifikasi AI |

### Tier Access (Monetisasi Platform)

| Tier | Harga | Akses |
|---|---|---|
| **Free** | Gratis | Hanya UMKM Grade C |
| **Premium** | Rp 49.000/bulan | Grade A, B, C + Analitik Portofolio Lanjutan |

---

## 4. Arsitektur Sistem: "Fiat-to-Chain"

### Prinsip Inti
> **Blockchain bukan alat pembayaran.** Blockchain adalah **immutable audit trail**.
> Semua transaksi uang nyata melewati **Xendit (Rupiah/IDR)**. Polygon hanya menyimpan bukti.

### Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PENGGUNA (Browser)                          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │   Investor   │  │  UMKM Owner  │  │  Admin (future)           │ │
│  │   Dashboard  │  │  Dashboard   │  │                           │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────────┘ │
│         │                 │                                         │
└─────────┼─────────────────┼─────────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js + Tailwind)                     │
│                   Deployed on Vercel                                │
│                   API calls via REST/tRPC                           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              BACKEND API GATEWAY (Node.js + Express)                │
│                                                                     │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────────────────┐  │
│  │ Auth/User  │  │ Investment API │  │ Webhook Receiver (Xendit) │  │
│  │ Routes     │  │ CRUD           │  │ Idempotent Processing    │  │
│  └────────────┘  └────────────────┘  └──────────┬───────────────┘  │
│                                                  │                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    BullMQ Job Queue (Redis)                  │   │
│  │          Ensures exactly-once processing of payments         │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │                   PostgreSQL (Prisma ORM)                    │   │
│  │  Tables: User, UMKM, Investment, Tranche, Transaction       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              RELAYER ENGINE (Ethers.js + Cron)                │   │
│  │  • Daily Merkle Root batching (23:59)                        │   │
│  │  • Calls Smart Contract via Relayer Wallet                  │   │
│  │  • Stores Polygon TX Hash back to PostgreSQL                │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
          ┌───────────────────┼────────────────────┐
          ▼                                        ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   AI MICROSERVICE    │              │   POLYGON BLOCKCHAIN     │
│   (FastAPI + Python) │              │   (Sepolia Testnet)      │
│                      │              │                          │
│  • OCR Receipt       │              │  NemosEscrowLedger.sol   │
│    Verification      │              │  • recordMerkleRoot()    │
│    (Gemini Vision)   │              │  • releaseTranche()      │
│  • Macro Limit Check │              │  • getDisbursement()     │
│  • Confidence Score  │              │                          │
└──────────────────────┘              └──────────────────────────┘
          │
          ▼
┌──────────────────────┐
│   XENDIT API         │
│   (Payment Gateway)  │
│                      │
│  • Dynamic QRIS      │
│  • Virtual Account   │
│  • Webhook callback  │
└──────────────────────┘
```

### Kunci Arsitektural

| Keputusan | Alasan |
|---|---|
| **Wallet-less** | Target user = masyarakat umum Indonesia. MetaMask = friction terlalu tinggi. |
| **Trusted Relayer** | Backend memegang private key, bertindak sebagai oracle antara dunia fiat dan blockchain. |
| **Merkle Batching** | Menghemat gas fee. Bukan 1 TX per investasi, tapi 1 TX per hari berisi Merkle Root dari semua transaksi hari itu. |
| **BullMQ** | Mencegah race condition dan double-processing pada webhook pembayaran Xendit. |
| **Tranche Disbursement** | Dana tidak dicairkan sekaligus. Tranche 1 otomatis, Tranche 2+ butuh verifikasi AI. |

---

## 5. Status Prototype Saat Ini

### Live URL
**https://nemos-three.vercel.app/** (React + Vite, deployed ke Vercel)

### Apa yang Sudah Ada (Frontend Only — Semua Data Statis)

| Halaman | Rute | Fungsi | Status |
|---|---|---|---|
| Landing Page | `/` | Hero, value proposition, CTA | ✅ UI Complete |
| Login | `/login` | Form login (dual-role) | ✅ UI Complete |
| Register | `/register` | Form registrasi multi-step | ✅ UI Complete |
| Onboarding | `/onboarding` | AI Risk Profiling quiz (5 pertanyaan) | ✅ UI Complete |
| Investor Dashboard | `/dashboard` | Portofolio, Repayment Tracker, UMKM Rekomendasi | ✅ UI Complete |
| AI Learn Hub | `/learn` | Kurikulum literasi keuangan (7 modul) | ✅ UI Complete |
| UMKM Arena | `/arena` | Marketplace UMKM — filter, search, tier-gating | ✅ UI Complete |
| UMKM Detail | `/detail/:id` | Profil UMKM, Chart, RBF Schema, Blockchain proof | ✅ UI Complete |
| Impact Report | `/impact` | Laporan dampak sosial (SDGs tracking) | ✅ UI Complete |
| Protection | `/protection` | Transparansi & perlindungan investor | ✅ UI Complete |
| UMKM Dashboard | `/umkm-dashboard` | Panel usaha Bu Sari (Dapur Nusantara) | ✅ UI Complete |
| UMKM Omzet | `/umkm-omzet` | Laporan omzet harian/bulanan | ✅ UI Complete |
| UMKM Kewajiban | `/umkm-kewajiban` | Jadwal pembayaran bagi hasil | ✅ UI Complete |
| UMKM Komunitas | `/umkm-komunitas` | Forum komunitas UMKM | ✅ UI Complete |

### Dual-Role System (Sudah Diimplementasikan di UI)
Prototype memiliki **Role Switcher** (tombol floating di kanan bawah) yang mengubah tampilan antara:
- **Investor** → TopNav horizontal, warna navy (#1E3A5F)
- **Pengusaha UMKM** → Sidebar vertikal, warna hijau (#00C853)

### Apa yang BELUM Ada (Target MVP)
- ❌ Backend API (semua data hardcoded di frontend)
- ❌ Database (PostgreSQL)
- ❌ Authentication (JWT/session)
- ❌ Payment integration (Xendit)
- ❌ Smart Contract (Polygon)
- ❌ AI Microservice (FastAPI + Gemini Vision)
- ❌ Relayer Engine (Merkle batching)

---

## 6. Target Tech Stack MVP

| Layer | Teknologi | Justifikasi |
|---|---|---|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, TypeScript | SSR/SSG, API routes built-in, better SEO |
| **Backend API** | Node.js, Express.js, TypeScript | Ecosystem maturity, Ethers.js native support |
| **ORM** | Prisma | Type-safe queries, migration system, PostgreSQL support |
| **Database** | PostgreSQL | ACID compliance for financial transactions |
| **Queue** | Redis + BullMQ | Exactly-once processing, retry mechanism |
| **Smart Contract** | Solidity (Hardhat) | Polygon Sepolia testnet, low gas fees |
| **AI Service** | FastAPI (Python) | Async, Gemini Vision API integration |
| **Payment** | Xendit API | QRIS, VA, webhook-based confirmation |
| **Deployment** | Vercel (FE), Railway/Render (BE), Alchemy (RPC) | Cost-effective for MVP |

---

## 7. Data Model & Entity Relationship

### Entitas Utama

```
┌──────────┐     1:N     ┌─────────────┐     N:1     ┌──────────┐
│   User   │────────────▶│ Investment  │◀────────────│   UMKM   │
│          │             │             │              │          │
│ id       │             │ id          │              │ id       │
│ email    │             │ userId      │              │ name     │
│ role     │             │ umkmId      │              │ ownerId  │
│ tier     │             │ amount      │              │ grade    │
│ riskProf │             │ xenditTxId  │              │ target   │
└──────────┘             │ status      │              │ rbfRate  │
                         │ merkleProof │              │ category │
                         └──────┬──────┘              └──────────┘
                                │
                           1:N  │
                                ▼
                         ┌─────────────┐
                         │  Tranche    │
                         │             │
                         │ id          │
                         │ investId    │
                         │ stage       │  ← 1, 2, 3...
                         │ amount      │
                         │ aiVerified  │  ← boolean
                         │ confidence  │  ← 0-100%
                         │ receiptUrl  │
                         │ releasedAt  │
                         └──────┬──────┘
                                │
                           1:N  │
                                ▼
                         ┌─────────────┐
                         │ Transaction │
                         │             │
                         │ id          │
                         │ xenditId    │  ← Idempotency Key
                         │ type        │  ← 'investment' | 'repayment'
                         │ amount      │
                         │ polygonTxH  │  ← TX hash setelah Merkle batch
                         │ merkleRoot  │
                         │ status      │
                         │ createdAt   │
                         └─────────────┘
```

### Prisma Schema (Draft)

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  password    String       // bcrypt hashed
  name        String
  role        Role         // INVESTOR | UMKM_OWNER
  tier        Tier         @default(FREE)  // FREE | PREMIUM
  riskProfile RiskProfile? // KONSERVATIF | MODERAT | AGRESIF
  investments Investment[]
  umkm        UMKM?
  createdAt   DateTime     @default(now())
}

model UMKM {
  id          String       @id @default(cuid())
  name        String
  location    String
  category    String       // Kuliner, Agrikultur, Kerajinan
  grade       Grade        // A | B | C
  target      BigInt       // dalam Rupiah
  current     BigInt       @default(0)
  rbfRate     Float        // e.g. 0.05
  ownerId     String       @unique
  owner       User         @relation(fields: [ownerId], references: [id])
  investments Investment[]
}

model Investment {
  id           String       @id @default(cuid())
  amount       BigInt
  userId       String
  user         User         @relation(fields: [userId], references: [id])
  umkmId       String
  umkm         UMKM         @relation(fields: [umkmId], references: [id])
  xenditTxId   String       @unique  // Idempotency Key
  merkleLeaf   String?      // keccak256 hash
  status       InvestStatus @default(PENDING)
  tranches     Tranche[]
  transactions Transaction[]
  createdAt    DateTime     @default(now())
}
```

---

## 8. System Flows

### Flow 1: Investor Melakukan Investasi

```
Investor (Browser)          Next.js          Express API       Xendit         Redis/BullMQ      PostgreSQL       Polygon
     │                        │                  │               │                │                 │               │
     │─── Pilih UMKM ────────▶│                  │               │                │                 │               │
     │                        │── POST /invest ─▶│               │                │                 │               │
     │                        │                  │── Create QR ─▶│                │                 │               │
     │                        │                  │◀── QR URL ────│                │                 │               │
     │◀── Tampilkan QRIS ────│                  │               │                │                 │               │
     │                        │                  │               │                │                 │               │
     │─── Scan & Bayar ──────────────────────────────────────────▶                │                 │               │
     │                        │                  │               │                │                 │               │
     │                        │                  │◀── Webhook ───│                │                 │               │
     │                        │                  │── Enqueue ────────────────────▶│                 │               │
     │                        │                  │               │                │── Dequeue ─────▶│               │
     │                        │                  │               │                │  (with idempot) │               │
     │                        │                  │               │                │                 │── Save ──────▶│
     │                        │                  │               │                │                 │               │
     │                        │                  │               │         [23:59 CRON]             │               │
     │                        │                  │               │                │◀── Pull daily ──│               │
     │                        │                  │               │                │── Merkle Tree ──────────────────▶│
     │                        │                  │               │                │◀── TX Hash ─────────────────────│
     │                        │                  │               │                │── Update TX ───▶│               │
```

### Flow 2: UMKM Mengajukan Pencairan Tranche

```
UMKM Owner (Camera)        Next.js          Express API       FastAPI (AI)     PostgreSQL       Polygon
     │                        │                  │               │                │               │
     │── Upload Foto Struk ──▶│                  │               │                │               │
     │                        │── POST /tranche ▶│               │                │               │
     │                        │  (with image)    │── POST /verify ▶              │               │
     │                        │                  │               │── Gemini OCR ─▶│               │
     │                        │                  │               │◀── result ─────│               │
     │                        │                  │◀── { score,   │                │               │
     │                        │                  │     isValid } │                │               │
     │                        │                  │               │                │               │
     │                        │                  │── IF score >= 85% ────────────▶│               │
     │                        │                  │   Release tranche              │               │
     │                        │                  │   Record on-chain ─────────────────────────────▶│
     │                        │                  │               │                │               │
     │◀── "Tranche Dicairkan" │                  │               │                │               │
```

---

## 9. Smart Contract Design

### `NemosEscrowLedger.sol`

**Tujuan**: Immutable ledger untuk pencatatan pendanaan dan pencairan. Bukan escrow dalam arti "memegang uang kripto" — uang tetap di Xendit/bank.

```
Contract: NemosEscrowLedger
├── State Variables
│   ├── address relayerWallet          // Satu-satunya address yang bisa menulis
│   ├── mapping(bytes32 => bool) merkleRoots  // Catatan Merkle Root harian
│   └── struct Disbursement { umkmId, trancheId, amount, timestamp, aiScore }
│
├── Functions (onlyRelayer)
│   ├── recordDailyMerkleRoot(bytes32 _root)     // Batch pencatatan harian
│   ├── releaseTranche(bytes32 _umkmId, ...)     // Catat pencairan tranche
│   └── pause() / unpause()                       // Emergency circuit breaker
│
├── View Functions (public)
│   ├── verifyMerkleProof(bytes32[] proof, ...)   // Siapapun bisa verifikasi
│   ├── getDisbursement(bytes32 _id)              // Baca data pencairan
│   └── getMerkleRoot(uint256 _day)               // Baca Merkle Root hari tertentu
│
└── Events
    ├── MerkleRootRecorded(uint256 indexed day, bytes32 root)
    ├── TrancheReleased(bytes32 indexed umkmId, uint256 amount, uint8 aiScore)
    └── RelayerUpdated(address oldRelayer, address newRelayer)
```

### Security Considerations
- **onlyRelayer modifier**: Hanya wallet relayer backend yang bisa menulis.
- **ReentrancyGuard**: Meskipun tidak memegang ETH/MATIC, tetap diterapkan sebagai best practice.
- **Pausable**: Emergency stop jika ditemukan bug.
- **No ETH/Token transfers**: Contract TIDAK menerima atau mengirim crypto. Murni data storage.

---

## 10. AI Microservice Design

### Endpoints

| Method | Endpoint | Input | Output |
|---|---|---|---|
| `POST` | `/api/ai/verify-receipt` | Gambar struk (multipart) + RAB JSON | `{ isValid: bool, confidence: 0-100, items: [...] }` |
| `GET` | `/api/ai/macro-limit-check` | `?sector=Kuliner` | `{ currentExposure: 35%, limit: 40%, allowed: true }` |
| `POST` | `/api/ai/grade-umkm` | Financial data JSON | `{ grade: "A", factors: [...], riskScore: 0.2 }` |

### Receipt Verification Flow (Gemini Vision)

```python
# Pseudocode — verify-receipt endpoint
async def verify_receipt(image: UploadFile, rab: dict):
    # 1. Encode image to base64
    img_b64 = base64.b64encode(await image.read())

    # 2. Construct prompt for Gemini Vision
    prompt = f"""
    Kamu adalah auditor keuangan UMKM.
    Cocokkan item di struk/nota ini dengan Rencana Anggaran Biaya:
    RAB: {json.dumps(rab)}

    Return JSON:
    - items_found: list of matched items
    - total_receipt: total harga di struk
    - total_rab_match: jumlah yang cocok dengan RAB
    - confidence_score: 0-100
    - is_valid: true jika confidence >= 85
    """

    # 3. Call Gemini 3.1 Pro Vision
    response = gemini_client.generate(prompt, image=img_b64)

    # 4. Parse dan return
    return parse_gemini_response(response)
```

### Hard Concentration Limit
- Platform membatasi **eksposur satu sektor UMKM tidak boleh melebihi 40%** dari total GMV.
- Dicek sebelum transaksi investasi diizinkan.
- Mencegah risiko sistemik jika satu sektor gagal.

---

## 11. Sprint Roadmap

### Sprint 1 — Smart Contract Foundation
**Durasi**: ~1 minggu
| Task | Deliverable |
|---|---|
| Setup Hardhat project | `hardhat.config.ts`, toolchain |
| Implement `NemosEscrowLedger.sol` | Contract with Merkle Root + Tranche logic |
| Write unit tests | 100% coverage on critical paths |
| Deploy script | Polygon Sepolia testnet deployment |
| Document contract ABI | For backend integration |

### Sprint 2 — Backend API + Database
**Durasi**: ~1.5 minggu
| Task | Deliverable |
|---|---|
| Setup Express + Prisma | Project scaffold, DB schema |
| Auth endpoints | JWT-based auth (register, login) |
| Investment endpoints | CRUD + Xendit QR generation |
| Xendit webhook receiver | Idempotent payment processing |
| BullMQ workers | Queue processing with retry logic |

### Sprint 3 — AI Microservice
**Durasi**: ~1 minggu
| Task | Deliverable |
|---|---|
| Setup FastAPI project | Python scaffold |
| Receipt verification endpoint | Gemini Vision integration |
| Macro limit check | Concentration limit logic |
| UMKM grading endpoint | AI-based credit scoring |

### Sprint 4 — Relayer Engine
**Durasi**: ~1 minggu
| Task | Deliverable |
|---|---|
| Ethers.js setup | Relayer wallet integration |
| Daily cron job | Merkle Tree batching at 23:59 |
| On-chain recording | `recordDailyMerkleRoot()` execution |
| TX hash storage | Back to PostgreSQL |

### Sprint 5 — Frontend Migration & Integration
**Durasi**: ~2 minggu
| Task | Deliverable |
|---|---|
| Migrate Vite → Next.js | New project with Tailwind |
| Port existing UI components | All 14 pages |
| Connect to backend API | Dynamic data throughout |
| Xendit QRIS in UI | Payment flow |
| UMKM receipt upload | Camera → AI verification |

---

## 12. Engineering Rules of Engagement

### Rule 1: Zero Guesswork (Anti-Halusinasi)
- Jangan menulis kode jika konteks tidak lengkap.
- Jangan menebak nama fungsi library yang belum diverifikasi.
- Jika ragu, **STOP** dan tanyakan.

### Rule 2: Idempotency adalah Harga Mati
Setiap proses yang melibatkan uang atau state blockchain **WAJIB** memiliki:
- Idempotency Key (berdasarkan Xendit Transaction ID)
- Retry mechanism via BullMQ
- Database-level uniqueness constraint

### Rule 3: Separation of Concerns
```
Fiat Logic (Xendit)  ←→  JANGAN DICAMPUR  ←→  Blockchain Logic (Ethers.js)
```
Pisahkan ke module/file berbeda. Backend bertindak sebagai **orchestrator** di tengah.

### Rule 4: Self-Audit di Akhir Setiap Sprint
Sebelum merge, jalankan checklist:
- [ ] Logic flaws?
- [ ] Race conditions? (terutama di Redis/BullMQ workers)
- [ ] Reentrancy vulnerability? (di Solidity)
- [ ] Idempotency di transaksi finansial?
- [ ] Error handling untuk setiap external API call (Xendit, Gemini, Alchemy)?

### Rule 5: No Crypto Wallet for Users
User TIDAK PERNAH menyentuh MetaMask, mnemonic, atau private key.
Semua interaksi blockchain = backend relayer.

---

## Lampiran: Prototype Screenshot Reference

Prototype sudah live dan dapat diakses di:
**https://nemos-three.vercel.app/**

Halaman yang perlu diamati:
- `/` — Landing page dengan value proposition
- `/onboarding` — Risk profiling quiz (5 pertanyaan, AI-scored)
- `/dashboard` — Investor dashboard dengan smart contract repayment tracker
- `/arena` — UMKM marketplace dengan tier-gating (Free vs Premium)
- `/detail/0` — Detail UMKM "Kedai Kopi Senja" (chart, RBF schema, blockchain proof)
- `/umkm-dashboard` — Panel usaha UMKM (perspective Bu Sari, Dapur Nusantara)

Semua data saat ini **hardcoded** di file `src/data.js` dan masing-masing komponen page.
Target MVP: mengganti semua data statis dengan API calls ke backend.

---

*Dokumen ini akan terus diperbarui seiring perkembangan sprint.*
*Last updated: 31 Maret 2026*
