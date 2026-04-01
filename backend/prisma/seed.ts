/**
 * prisma/seed.ts — Database Seed Script
 *
 * Sprint 6 [P1-NEW-05]: Inject dummy data for demo/hackathon.
 *
 * Creates:
 * - 1 Investor user (Budi Santoso) with PREMIUM tier
 * - 1 UMKM Owner user (Bu Sari) 
 * - 1 UMKM record (Dapur Nusantara) linked to Bu Sari
 * - 2 Investment records from Budi → Dapur Nusantara
 * - 1 Confirmed Transaction with polygon TX hash
 *
 * Run: npx prisma db seed
 * Or:  npx tsx prisma/seed.ts
 *
 * IMPORTANT: Does NOT modify schema.prisma.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEMOS database...\n");

  // ── 1. INVESTOR USER: Budi Santoso ─────────────────────
  const hashedPasswordBudi = await bcrypt.hash("password123", 10);

  const budi = await prisma.user.upsert({
    where: { email: "budi@nemos.id" },
    update: {},
    create: {
      email: "budi@nemos.id",
      password: hashedPasswordBudi,
      name: "Budi Santoso",
      role: "INVESTOR",
      tier: "PREMIUM",
      riskProfile: "KONSERVATIF",
      learningProgress: 100,
    },
  });
  console.log(`✅ Investor: ${budi.name} (${budi.email}) — Tier: ${budi.tier}`);

  // ── 2. UMKM OWNER USER: Bu Sari ───────────────────────
  const hashedPasswordSari = await bcrypt.hash("password123", 10);

  const sari = await prisma.user.upsert({
    where: { email: "sari@nemos.id" },
    update: {},
    create: {
      email: "sari@nemos.id",
      password: hashedPasswordSari,
      name: "Bu Sari",
      role: "UMKM_OWNER",
      tier: "FREE",
      learningProgress: 0,
    },
  });
  console.log(`✅ UMKM Owner: ${sari.name} (${sari.email})`);

  // ── 3. UMKM: Dapur Nusantara ──────────────────────────
  // Check if UMKM already exists for this owner
  const existingUmkm = await prisma.uMKM.findUnique({
    where: { ownerId: sari.id },
  });

  const umkm = existingUmkm || await prisma.uMKM.create({
    data: {
      name: "Dapur Nusantara",
      location: "Bandung, Jawa Barat",
      category: "Kuliner",
      grade: "A",
      target: BigInt(50_000_000),
      current: BigInt(37_500_000),
      rbfRate: 0.05,
      description: "Usaha kuliner rumahan yang memberdayakan ibu rumah tangga lokal. Menyediakan makanan tradisional Nusantara dengan sentuhan modern.",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600",
      ownerId: sari.id,
    },
  });
  console.log(`✅ UMKM: ${umkm.name} — Grade ${umkm.grade} — Target: Rp ${Number(umkm.target).toLocaleString("id-ID")}`);

  // ── 4. INVESTMENTS: Budi → Dapur Nusantara ─────────────
  const existingInvestments = await prisma.investment.findMany({
    where: { userId: budi.id, umkmId: umkm.id },
  });

  if (existingInvestments.length === 0) {
    const inv1 = await prisma.investment.create({
      data: {
        amount: BigInt(25_000_000),
        userId: budi.id,
        umkmId: umkm.id,
        xenditTxId: `nemos-seed-inv-001-${Date.now()}`,
        status: "ACTIVE",
      },
    });

    const inv2 = await prisma.investment.create({
      data: {
        amount: BigInt(12_500_000),
        userId: budi.id,
        umkmId: umkm.id,
        xenditTxId: `nemos-seed-inv-002-${Date.now()}`,
        status: "ACTIVE",
      },
    });

    console.log(`✅ Investment 1: Rp ${Number(inv1.amount).toLocaleString("id-ID")} (ACTIVE)`);
    console.log(`✅ Investment 2: Rp ${Number(inv2.amount).toLocaleString("id-ID")} (ACTIVE)`);

    // ── 5. TRANSACTION: Confirmed with Polygon TX Hash ────
    await prisma.transaction.create({
      data: {
        xenditId: `nemos-seed-tx-001-${Date.now()}`,
        type: "INVESTMENT",
        amount: BigInt(25_000_000),
        status: "CONFIRMED",
        investId: inv1.id,
        polygonTxHash: "0x8a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a",
        merkleRoot: "0xabc123def456789",
      },
    });
    console.log(`✅ Transaction: CONFIRMED with Polygon TX Hash`);
  } else {
    console.log(`ℹ️  Investments already exist (${existingInvestments.length}), skipping...`);
  }

  console.log("\n🎉 NEMOS database seeded successfully!");
  console.log("   Login credentials:");
  console.log("   Investor: budi@nemos.id / password123");
  console.log("   UMKM:     sari@nemos.id / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
