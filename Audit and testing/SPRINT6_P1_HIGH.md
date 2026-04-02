# SPRINT 6 — P1 HIGH: SCALABILITY FINDINGS — POST-REMEDIATION

> **Audit Date:** 2026-04-02 | **Remediation Date:** 2026-04-02
> **Status:** 4/6 FIXED (2 deferred per Hackathon Exception Rule)

---

- [ ] **[PERF-P1-01] Prisma Connection Pool** → ⏭ DEFERRED (Hackathon Exception Rule)

- [x] **[PERF-P1-02] Merkle Batch Unbounded Promise.all** → ✅ FIXED
  **Fix:** `merkle.worker.ts` — Added `chunkArray()` helper (CHUNK_SIZE=50). `Promise.all` now processes 50 updates at a time instead of all at once.

- [x] **[PERF-P1-03] Invest Route Non-Atomic** → ✅ FIXED
  **Fix:** `invest.routes.ts` — Investment + Transaction creation wrapped in `prisma.$transaction()`. Xendit call outside TX with manual rollback on failure. Zero orphaned records.

- [ ] **[PERF-P1-04] Base64 Image Size** → ⏭ DEFERRED (Hackathon Exception Rule)

- [x] **[PERF-P1-05] UMKM Detail Unbounded Query** → ✅ FIXED
  **Fix:** `umkm.routes.ts` — Added `take: 10` + `orderBy: { createdAt: "desc" }` on investments include.

- [x] **[PERF-P1-06] Payment Worker Concurrency** → ✅ FIXED
  **Fix:** `payment.worker.ts` — Concurrency reduced from 5 → 3 to prevent DB pool contention.
