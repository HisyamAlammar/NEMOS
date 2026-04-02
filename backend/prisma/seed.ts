/**
 * prisma/seed.ts — Database Seed Script
 *
 * Sprint 6 [P1-NEW-05]: Inject dummy data for demo/hackathon.
 * Creates 5 UMKM records with their owners to populate the Arena.
 * Creates 1 Investor user with PREMIUM access.
 *
 * Run: npx prisma db seed
 * Or:  npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEMOS database for Demo Hackathon...\n");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // ── 1. INVESTOR USER ───────────────────────────────────
  const investor = await prisma.user.upsert({
    where: { email: "investor@nemos.id" },
    update: {},
    create: {
      email: "investor@nemos.id",
      password: defaultPassword,
      name: "Budi (Demo Investor)",
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
      ownerEmail: "sari@nemos.id",
      ownerName: "Bu Sari",
      umkmName: "Kedai Kopi Senja",
      location: "Jakarta Selatan",
      category: "Kuliner",
      grade: "A",
      target: 25_000_000,
      current: 12_500_000,
      rbfRate: 0.05,
      description: "Kedai kopi susu kekinian yang jadi langganan anak muda dan pekerja. Menawarkan kopi dengan biji lokal terbaik Nusantara.",
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
    },
    {
      ownerEmail: "andi@nemos.id",
      ownerName: "Pak Andi",
      umkmName: "Tani Makmur Organik",
      location: "Cianjur, Jawa Barat",
      category: "Agrikultur",
      grade: "B",
      target: 75_000_000,
      current: 25_000_000,
      rbfRate: 0.08,
      description: "Pertanian sayur dan buah lokal organik bersertifikat dengan metode irigasi pintar yang siap diekspor.",
      imageUrl: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=600"
    },
    {
      ownerEmail: "ratna@nemos.id",
      ownerName: "Ibu Ratna",
      umkmName: "Batik Cempaka",
      location: "Solo, Jawa Tengah",
      category: "Kerajinan",
      grade: "A",
      target: 40_000_000,
      current: 20_000_000,
      rbfRate: 0.06,
      description: "Galeri batik tulis kontemporer yang menggabungkan motif tradisional dengan pendekatan fashion millenial.",
      imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600"
    },
    {
      ownerEmail: "arif@nemos.id",
      ownerName: "Mas Arif",
      umkmName: "Bengkel Motor Jaya",
      location: "Surabaya, Jawa Timur",
      category: "Jasa",
      grade: "C",
      target: 15_000_000,
      current: 5_000_000,
      rbfRate: 0.12,
      description: "Bengkel spesialis restorasi motor klasik yang butuh tambahan alat presisi dan montir.",
      imageUrl: "https://images.unsplash.com/photo-1507914841961-7ec87b92a3b0?auto=format&fit=crop&q=80&w=600"
    },
    {
      ownerEmail: "tiara@nemos.id",
      ownerName: "Mbak Tiara",
      umkmName: "Hijab Modest.id",
      location: "Bandung, Jawa Barat",
      category: "Fashion",
      grade: "B",
      target: 30_000_000,
      current: 22_500_000,
      rbfRate: 0.07,
      description: "Toko dan brand modest wear yang memproduksi pakaian sehari-hari secara lokal dengan bahan rmah lingkungan.",
      imageUrl: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=600"
    }
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
      console.log(`✅ UMKM Seeded: ${umkm.name} — Grade ${umkm.grade} — Owner: ${owner.name}`);
    } else {
      console.log(`ℹ️  UMKM ${data.umkmName} already exists, skipping...`);
    }
  }

  console.log("\n🎉 NEMOS database seeded successfully!");
  console.log("   Test Accounts:");
  console.log("   - Investor: investor@nemos.id / password123");
  console.log("   - UMKM Owner: sari@nemos.id / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
