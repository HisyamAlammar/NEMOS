# SPRINT 6 — P1 HIGH: SCALABILITY & PERFORMANCE FINDINGS

> **Audit Mode:** READ-ONLY & EXPLOITATION
> **Auditor Role:** Scalability Architect
> **Date:** 2026-04-02

---

## Active Vulnerabilities

- [ ] **[PERF-P1-01] [Database] Prisma Client Singleton Tanpa Connection Pool Tuning**
  **Lokasi:** `prisma.service.ts` — `new PrismaClient()` tanpa konfigurasi `connection_limit` atau `pool_timeout`.
  **Dampak:** Di bawah load tinggi (50+ concurrent requests), Prisma default pool (5 koneksi) akan habis → semua request tertunda → timeout cascade. PostgreSQL connection limit (default 100) juga bisa tercapai saat multiple server instance berjalan.
  **Skenario:** 50 investor bersamaan klik "Konfirmasi Pendanaan" → 50 query `findUnique(UMKM)` + 50 `create(Investment)` + 50 `create(Transaction)` = 150 queries paralel → pool exhaustion.
  **Rekomendasi:** Tambahkan `datasource db { ... }` di schema.prisma atau gunakan `?connection_limit=20&pool_timeout=30` di `DATABASE_URL`.

---

- [ ] **[PERF-P1-02] [Worker] Merkle Batch `Promise.all()` Tanpa Chunking — Memory Spike**
  **Lokasi:** `merkle.worker.ts:146-158` — `Promise.all(transactions.map(...))` menjalankan semua `prisma.transaction.update()` secara paralel tanpa batasan.
  **Dampak:** Jika ada 10,000 transaksi tertebak dalam satu batch:
  - 10,000 Prisma queries dijalankan bersamaan → memory spike + connection pool exhaustion
  - 10,000 `createLeafHash()` calls membuat 10,000 SHA-256 digests → CPU spike (meskipun cepat per-item)
  - `computeMerkleRoot()` melakukan in-memory sort + concatenation di loop → O(n log n) memory
  **Skenario Reproduksi:** Seed 10,000 transaksi PENDING → Trigger cron → OOM kill di server kecil (512MB RAM).
  **Rekomendasi:** Chunk `Promise.all()` menjadi batch 100 items. Gunakan `prisma.transaction.updateMany()` untuk bulk update.

---

- [ ] **[PERF-P1-03] [API] Invest Route Membuat 3 DB Calls + 1 HTTP Call Secara Seri**
  **Lokasi:** `invest.routes.ts:50-133` — Flow investasi:
  1. `findUnique(UMKM)` — DB call
  2. `findUnique(User)` — DB call (bisa digabung dgn #1 via JOIN)
  3. `create(Investment)` — DB call
  4. `createQrisPayment()` — External HTTP ke Xendit (bisa timeout 15s)
  5. `create(Transaction)` — DB call
  **Dampak:** Latency tinggi (~500ms-2s per request). Jika Xendit timeout (15s via AbortSignal), user menunggu 15 detik sebelum melihat error.
  **Catatan Kritis:** Step 3-5 TIDAK dibungkus `prisma.$transaction()`. Jika Xendit gagal SETELAH Investment dibuat, rollback dilakukan manual via `prisma.investment.delete()` (line 115). Ini aman TAPI bukan atomic — jika server crash antara step 3 dan rollback, **orphaned Investment record** tertinggal di database.
  **Rekomendasi:** Gabung query 1 & 2, bungkus 3-5 dalam `$transaction`.

---

- [ ] **[PERF-P1-04] [AI Service] Base64 Image Payload Tanpa Size Limit di OpenAI SDK Call**
  **Lokasi:** `gemini_service.py:85-86` — Image di-encode ke Base64 dalam memory. Base64 menambahkan ~33% overhead.
  **Dampak:** Gambar 10MB (max di router) → ~13.3MB Base64 string di memory → dikirim ke NVIDIA NIM. Jika 10 user upload bersamaan → 133MB+ memory consumption di Python process. FastAPI default worker (single process) bisa OOM.
  **Skenario:** Upload 10MB WebP struk → Python process memory spike → slowdown seluruh OCR endpoint.
  **Rekomendasi:** Kompres gambar ke max 1MB sebelum encode (Pillow/PIL). Atau stream upload langsung tanpa full-buffer.

---

- [ ] **[PERF-P1-05] [Database] UMKM Detail Query Memuat SEMUA Investments + Transactions (Unbounded)**
  **Lokasi:** `umkm.routes.ts:69-93` — Query UMKM detail menggunakan `include: { investments: { include: { transactions: ... } } }` tanpa `take` limit pada investments.
  **Dampak:** UMKM populer dengan 1,000+ investors → 1,000 investment records + N transaction records dimuat ke memory → response payload 100KB+ → slow render di mobile.
  **Skenario:** UMKM Dapur Nusantara mendapat 500 investor → `GET /api/umkm/:id` returns 500 investment objects + flatten transactions → slow.
  **Rekomendasi:** Tambahkan `take: 10` pada `investments` include, atau gunakan `_count` aggregation.

---

- [ ] **[PERF-P1-06] [Queue] BullMQ Payment Worker Concurrency 5 Tanpa Backpressure**
  **Lokasi:** `payment.worker.ts:121` — `concurrency: 5` artinya 5 payment jobs diproses bersamaan. Setiap job menjalankan `prisma.$transaction()` yang membuka 1 connection + N queries.
  **Dampak:** 5 × (1 findUnique + 1 upsert + 1 update + 1 update + 1 create) = 25 queries bersamaan dari worker saja. Ditambah API traffic → Prisma pool contention.
  **Rekomendasi:** Turunkan concurrency ke 3, atau naikkan connection pool.

---

## Previously Fixed — Verified Stable at Scale

- [x] **[H-01] Required Env Vars** → ✅ 9 vars validated
- [x] **[H-NEW-02] rawPayload mismatch** → ✅ Removed
- [x] **[H-NEW-03] riskProfile mismatch** → ✅ Removed
- [x] **[H-04] Redlock distributed lock** → ✅ Implemented with retryCount: 0
