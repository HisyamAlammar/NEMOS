/**
 * prisma/seed.ts — Database Seed Script
 *
 * Sprint 6 Batch 6 [CTO-03]: Seed NEMOS demo data.
 * Creates 5 UMKM records with their owners + 1 Investor.
 * All passwords: demo123456
 *
 * Run: npx prisma db seed
 * Or:  npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEMOS database for Demo Hackathon...\n");

  const defaultPassword = await bcrypt.hash("demo123456", 10);

  // ── 1. INVESTOR USER ───────────────────────────────────
  const investor = await prisma.user.upsert({
    where: { email: "budi.santoso@nemos.id" },
    update: {},
    create: {
      email: "budi.santoso@nemos.id",
      password: defaultPassword,
      name: "Budi Santoso",
      role: "INVESTOR",
      tier: "PREMIUM",
      riskProfile: "MODERAT",
      learningProgress: 100,
    },
  });
  console.log(`✅ Investor: ${investor.name} (${investor.email})`);

  // ── 2. UMKM OWNERS & DATA ──────────────────────────────
  const umkmsData = [
    {
      ownerEmail: "ilham.kopisenja@nemos.id",
      ownerName: "Bapak Ilham",
      umkmName: "Kedai Kopi Senja",
      location: "Yogyakarta",
      category: "Kuliner",
      grade: "A",
      target: 40_000_000,
      current: 35_200_000,
      rbfRate: 0.05,
      description:
        "Kedai kopi susu kekinian yang jadi langganan anak muda dan pekerja. Menawarkan kopi dengan biji lokal terbaik Nusantara.",
      imageUrl:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
    },
    {
      ownerEmail: "ningsih.tanimakmur@nemos.id",
      ownerName: "Ibu Ningsih",
      umkmName: "Tani Makmur Organik",
      location: "Malang",
      category: "Agrikultur",
      grade: "A",
      target: 30_000_000,
      current: 26_400_000,
      rbfRate: 0.04,
      description:
        "Pertanian sayur dan buah lokal organik bersertifikat dengan metode irigasi pintar yang siap diekspor.",
      imageUrl:
        "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=600",
    },
    {
      ownerEmail: "ratna.batikcempaka@nemos.id",
      ownerName: "Ibu Ratna",
      umkmName: "Batik Cempaka",
      location: "Solo",
      category: "Kerajinan",
      grade: "B",
      target: 20_000_000,
      current: 14_000_000,
      rbfRate: 0.06,
      description:
        "Galeri batik tulis kontemporer yang menggabungkan motif tradisional dengan pendekatan fashion millenial.",
      imageUrl:
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600",
    },
    {
      ownerEmail: "sari.dapur@nemos.id",
      ownerName: "Ibu Sari",
      umkmName: "Dapur Nusantara",
      location: "Bandung, Jawa Barat",
      category: "Kuliner",
      grade: "A",
      target: 50_000_000,
      current: 37_500_000,
      rbfRate: 0.05,
      description:
        "Dapur katering rumahan yang menyediakan masakan Nusantara autentik untuk acara kantor dan keluarga.",
      imageUrl:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600",
    },
    {
      ownerEmail: "tini.warungsayur@nemos.id",
      ownerName: "Ibu Tini",
      umkmName: "Warung Sayur Segar Bu Tini",
      location: "Semarang",
      category: "Kuliner",
      grade: "C",
      target: 8_000_000,
      current: 2_400_000,
      rbfRate: 0.07,
      description:
        "Warung sayur organik segar langsung dari petani lokal dengan harga terjangkau untuk warga sekitar.",
      imageUrl:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=600",
    },
  ];

  for (const data of umkmsData) {
    const owner = await prisma.user.upsert({
      where: { email: data.ownerEmail },
      update: {},
      create: {
        email: data.ownerEmail,
        password: defaultPassword,
        name: data.ownerName,
        role: "UMKM_OWNER",
        tier: "FREE",
      },
    });

    // Check if UMKM already exists for this owner
    const existingUmkm = await prisma.uMKM.findUnique({
      where: { ownerId: owner.id },
    });

    if (!existingUmkm) {
      const umkm = await prisma.uMKM.create({
        data: {
          name: data.umkmName,
          location: data.location,
          category: data.category,
          grade: data.grade as "A" | "B" | "C",
          target: BigInt(data.target),
          current: BigInt(data.current),
          rbfRate: data.rbfRate,
          description: data.description,
          imageUrl: data.imageUrl,
          ownerId: owner.id,
        },
      });
      console.log(
        `✅ UMKM Seeded: ${umkm.name} — Grade ${umkm.grade} — Owner: ${owner.name}`
      );
    } else {
      console.log(`ℹ️  UMKM ${data.umkmName} already exists, skipping...`);
    }
  }

  console.log("\n=== SEED SELESAI ===");
  console.log("\nAkun demo (semua password: demo123456):");
  console.log("Investor  : budi.santoso@nemos.id");
  console.log("UMKM #1   : ilham.kopisenja@nemos.id    (Kedai Kopi Senja)");
  console.log("UMKM #2   : ningsih.tanimakmur@nemos.id (Tani Makmur Organik)");
  console.log("UMKM #3   : ratna.batikcempaka@nemos.id (Batik Cempaka)");
  console.log("UMKM #4   : sari.dapur@nemos.id         (Dapur Nusantara)");
  console.log("UMKM #5   : tini.warungsayur@nemos.id   (Warung Sayur Bu Tini)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
