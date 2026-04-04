<div align="center">
  <img src="https://i.ibb.co.com/gLP2TFFp/NEMOS-LOGO.png" alt="NEMOS Logo" width="150" />
  <h1>NEMOS</h1>
  <p><strong>Democratizing Impact Investment via Revenue-Based Financing (RBF)</strong></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Polygon-8247E5?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon" />
  <img src="https://img.shields.io/badge/Mistral_AI-000000?style=for-the-badge&logo=mistral&logoColor=white" alt="NVIDIA NIM" />
  <img src="https://img.shields.io/badge/Xendit-1976D2?style=for-the-badge&logo=xendit&logoColor=white" alt="Xendit" />
</div>

<br />

NEMOS adalah platform inovatif yang merevolusi cara investasi UMKM di Indonesia melalui skema **Revenue-Based Financing (RBF)**. Kami menghubungkan investor dengan UMKM potensial secara transparan, aman, dan tanpa riba (bunga flat), dengan memanfaatkan kekuatan AI untuk verifikasi struk dan teknologi Blockchain untuk audit trail yang *immutable*.

---

## 🏗 Arsitektur "Fiat-to-Chain"

NEMOS menggunakan pendekatan hibrida pragmatis yang menggabungkan kemudahan uang fiat (Rupiah) dengan transparansi blockchain:

1. **Pembayaran Fiat (Xendit)**: Seluruh transaksi pendanaan (investor ke UMKM) dilakukan secara real-time via QRIS / Bank Transfer menggunakan payment gateway Xendit. Tidak ada kerumitan *crypto wallet* bagi pengguna awam.
2. **AI Verifikasi Otomatis (Mistral Large 3)**: Pengusaha UMKM mengunggah struk pengeluaran/pendapatan. Kami menggunakan layanan **NVIDIA NIM** (Mistral Large 3 Vision) untuk melakukan OCR dan pencocokan RAB (*Rencana Anggaran Biaya*) secara otomatis dan instan.
3. **Immutable Audit Trail (Polygon Amoy)**: NEMOS tidak menjadikan blockchain sebagai alat tukar, melainkan sebagai **buku besar publik** yang anti-manipulasi. Transaksi Xendit yang telah diverifikasi di-*batching* menggunakan struktur *Merkle Tree*, dan *Merkle Root*-nya di-anchor secara periodik ke jaringan Polygon (Amoy Testnet).

Pendekatan ini memastikan adopsi yang luas, biaya transaksi rendah, tanpa mengorbankan keamanan data!

---

## 🛠 Tech Stack Lengkap

Proyek ini dibagi menjadi tiga lapisan (*n-tier architecture*):

### 1. Frontend (Web App)
- **Framework**: React.js (Vite)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **UI/UX**: Custom CSS (Vanilla) dengan pendekatan "Glassmorphism" & Micro-animations

### 2. Backend (Core API Layer)
- **Runtime**: Node.js & Express.js (TypeScript)
- **Database**: PostgreSQL (via **Prisma** ORM)
- **Job Queue**: BullMQ & Redis (untuk *Merkle Tree generation* & *Smart Contract interactions*)
- **Payment Gateway**: Xendit Node SDK
- **Web3 Integrasi**: Ethers.js
- **Concurrency Control**: Redlock (Distributed lock untuk menghindari *race conditions* saat *Merkle Batching*)

### 3. AI Microservice (Vision/OCR Layer)
- **Framework**: FastAPI (Python)
- **Integrasi LLM VLM**: OpenAI Python SDK menembak endpoint **NVIDIA NIM**
- **Model**: `mistralai/mistral-large-3-675b-instruct-2512`

---

## 🔐 Prerequisites & Environment Variables

Pastikan Anda memiliki hal-hal berikut terinstal di sistem operasi Anda:
- Node.js (v18 atau terbaru)
- Python 3.10+
- PostgreSQL
- Redis Server (berjalan di background)

Buat file `.env` di dua lokasi, yakni di root `backend/` dan root `ai-service/`.

### Backend: `backend/.env`
```env
# Database & Redis
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nemos?schema=public"
REDIS_URL="redis://localhost:6379"

# Security (JWT)
JWT_SECRET="super-secret-key-for-jwt"

# Xendit Payment Gateway
XENDIT_SECRET_KEY="xnd_development_..."
XENDIT_WEBHOOK_TOKEN="xnd_webhook_..."

# Blockchain (Polygon Amoy)
RELAYER_PRIVATE_KEY="0x..." # Private key wallet amoy untuk membayar gas fee
POLYGON_AMOY_RPC="https://rpc-amoy.polygon.technology"
```

### AI Service: `ai-service/.env`
```env
# NVIDIA NIM AI
NVIDIA_API_KEY="nvapi-..."
PORT=8000
```

---

## 🚀 Installation & Running Locally

Ikuti instruksi langkah-demi-langkah ini untuk menjalankan NEMOS secara lokal:

### Langkah 1: Persiapkan Backend & Database
Buka terminal baru dan jalankan:
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Install dependencies (Pastikan Redlock, BullMQ, Prisma dkk terinstall)
npm install

# 3. Sinkronisasi skema database ke PostgreSQL
npx prisma db push

# 4. Injeksi data dummy untuk testing (Akun: budi@nemos.id & sari@nemos.id)
npx prisma db seed

# 5. Jalankan server Backend & Queue Worker (Port 4000)
npm run dev
```

### Langkah 2: Persiapkan AI Microservice
Buka terminal baru (*split terminal*) dan jalankan:
```bash
# 1. Masuk ke direktori AI service
cd ai-service

# 2. Install dependencies Python (FastAPI & OpenAI/NVIDIA support)
pip install -r requirements.txt

# 3. Jalankan server FastAPI (Port 8000)
py -m uvicorn main:app --reload --port 8000
```

### Langkah 3: Jalankan Frontend App
Buka terminal ketiga dan jalankan:
```bash
# 1. Tetap di direktori ROOT (tempat folder src/ berada)
npm install

# 2. Jalankan React Dev Server (Port 5173 standar Vite)
npm run dev
```

> **Akses Frontend:** Buka browser dan arahkan ke `http://localhost:5173`
> **Login Dummy:** 
> - Investor: `budi@nemos.id` / `password123`
> - UMKM: `sari@nemos.id` / `password123`

---
<p align="center">
  <i>Dibangun dengan ❤️ untuk mendorong kebangkitan finansial UMKM Indonesia</i>
</p>
