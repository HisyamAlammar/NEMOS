# NEMOS DEVELOPMENT MASTER BRIEF
**Role AI:** Senior Web3 & AI Architect (Expert in Node.js, Next.js, FastAPI, Solidity).
**Objective:** Mengembangkan platform NEMOS (Impact Investing Web3) dari fase prototype UI menjadi Minimum Viable Product (MVP) yang fungsional.

## 1. KONTEKS PROYEK & REFERENSI UI
- **Nama Proyek:** NEMOS (Democratizing Impact Investment Through AI and Blockchain)
- **Arsitektur Utama:** "Fiat-to-Chain". Transaksi uang nyata menggunakan API Xendit (Rupiah). Blockchain (Polygon) difungsikan murni sebagai *immutable ledger* dan pengunci logika, BUKAN sebagai alat pembayaran. Backend bertindak sebagai *Trusted Relayer Oracle*.
- **Referensi Frontend:** Prototype antarmuka sudah live di `https://nemos-three.vercel.app/`. Tugas di sisi frontend adalah mengonversi komponen statis ini menjadi dinamis dan menghubungkannya dengan API backend.

## 2. TECH STACK (WAJIB DIPATUHI)
- **Frontend:** Next.js (React), Tailwind CSS.
- **Backend (Relayer/API Gateway):** Node.js, Express.js, Ethers.js, Alchemy SDK.
- **AI Microservice:** FastAPI (Python), Gemini 3.1 Pro API (untuk OCR Vision & Analytics).
- **Database & Queue:** PostgreSQL (Prisma ORM) & Redis (BullMQ).
- **Smart Contract:** Solidity (Polygon Sepolia Testnet untuk MVP).
- **Payment Gateway:** Xendit (Dynamic QRIS & Escrow Virtual Account).

## 3. RULE OF ENGAGEMENT UNTUK AI
1. **Tidak Ada Asumsi Kripto:** Jangan pernah menulis logika di mana user harus menghubungkan dompet MetaMask. Sistem NEMOS bersifat *Wallet-less* bagi pengguna. Backend Node.js memegang *private key* relayer untuk berinteraksi dengan smart contract.
2. **Modular & Clean Code:** Pisahkan logika bisnis fiat (Xendit) dengan logika blockchain (Ethers.js).
3. **Idempotency:** Semua proses yang melibatkan uang atau state blockchain wajib memiliki *Idempotency Key* dan *Retry Mechanism* via Redis.

---

## 4. RENCANA EKSEKUSI: SPRINT DEVELOPMENT
Tugas pengembangan dibagi menjadi 5 Sprint. **Selesaikan satu Sprint dan minta persetujuan/review sebelum melanjutkan ke Sprint berikutnya.**

### SPRINT 1: Smart Contract & Web3 Foundation (Solidity)
**Target:** Membuat fondasi *Smart Contract* di Polygon.
**Task Checklist:**
- [ ] Buat kontrak `NemosEscrowLedger.sol`.
- [ ] Tulis logika penyimpanan data pendanaan (Struct UMKM, ID Investor, Jumlah).
- [ ] Buat fungsi `recordDailyMerkleRoot(bytes32 _merkleRoot)` untuk pencatatan *batching* transaksi harian.
- [ ] Buat fungsi logika *Tranche Disbursement* (Pencairan Bertahap) yang hanya bisa dipicu oleh *wallet relayer* (Backend NEMOS).
- [ ] Buat *script deploy* menggunakan Hardhat atau Foundry.

### SPRINT 2: Core Backend, Queue, & Database (Node.js + PostgreSQL)
**Target:** Membangun API Gateway dan infrastruktur antrean.
**Task Checklist:**
- [ ] Setup Express.js dan Prisma ORM dengan skema tabel: `User`, `UMKM`, `Investment`, `Tranche`, dan `Transactions`.
- [ ] Buat *endpoint webhook* untuk menerima notifikasi pembayaran sukses dari Xendit.
- [ ] Implementasikan Redis & BullMQ: Setiap *webhook* masuk diubah menjadi *Job* dengan *Idempotency Key* berdasarkan ID Transaksi Xendit.
- [ ] Buat *worker* BullMQ untuk memproses *Job* dari Redis dan menyimpannya secara aman ke PostgreSQL.

### SPRINT 3: AI Microservice & Verifikasi OCR (FastAPI + Python)
**Target:** Membangun otak analitik dan verifikasi pencairan dana.
**Task Checklist:**
- [ ] Setup FastAPI server.
- [ ] Buat endpoint `POST /api/ai/verify-receipt` yang menerima gambar struk dari UMKM.
- [ ] Integrasikan Gemini 3.1 Pro API (Vision). Prompt model untuk mencocokkan teks/harga di struk dengan JSON Rencana Anggaran Biaya (RAB).
- [ ] Return response berupa *confidence score* (0-100%) dan status boolean `isValid`. (Jika < 85%, flag untuk *Manual Review*).
- [ ] Buat endpoint `GET /api/ai/macro-limit-check` untuk mengecek *Hard Concentration Limits* (memastikan eksposur satu sektor UMKM tidak melebihi 40% dari total GMV sebelum transaksi diizinkan).

### SPRINT 4: Relayer Engine & Merkle Batching (Node.js + Ethers.js)
**Target:** Menghubungkan Backend Fiat dengan Smart Contract.
**Task Checklist:**
- [ ] Setup Ethers.js di Backend Express.js dengan *private key relayer* NEMOS.
- [ ] Buat *Cron Job* (berjalan pukul 23:59 setiap hari).
- [ ] Tarik semua transaksi Xendit sukses hari itu dari PostgreSQL.
- [ ] Gunakan `merkletreejs` untuk membuat Merkle Tree dari kumpulan transaksi harian tersebut.
- [ ] Eksekusi fungsi *smart contract* `recordDailyMerkleRoot()` menggunakan *wallet relayer*. Simpan *transaction hash* dari Polygon kembali ke PostgreSQL.

### SPRINT 5: Frontend Integration (Next.js)
**Target:** Menghubungkan UI di Vercel dengan API yang sudah dibuat.
**Task Checklist:**
- [ ] Integrasikan API Backend ke komponen UI yang ada di `https://nemos-three.vercel.app/`.
- [ ] Buat alur form *Investment Gate* (validasi literasi).
- [ ] Tampilkan QRCode Xendit di UI saat investor memilih UMKM.
- [ ] Buat *Dashboard* UMKM untuk mengunggah foto struk secara *live* (kamera device) demi pencairan *Tranche* tahap 2, lalu hubungkan (*hit*) ke API FastAPI OCR.

---
**Instruksi Memulai:**
Saya siap untuk memulai. Mari kita kerjakan **Sprint 1** terlebih dahulu. Tolong berikan arsitektur dan kode lengkap untuk file *Smart Contract* `NemosEscrowLedger.sol` dan *script testing/deploy*-nya.