import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Role } from "../lib/generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const engineering = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: { name: "Engineering", code: "ENG" },
  });

  await prisma.department.upsert({
    where: { code: "MKT" },
    update: {},
    create: { name: "Marketing", code: "MKT" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@cashnode.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cashnode.local",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "finance@cashnode.local" },
    update: {},
    create: {
      name: "Finance Officer",
      email: "finance@cashnode.local",
      passwordHash,
      role: Role.FINANCE,
    },
  });

  await prisma.user.upsert({
    where: { email: "pm@cashnode.local" },
    update: {},
    create: {
      name: "Project Manager",
      email: "pm@cashnode.local",
      passwordHash,
      role: Role.PM,
      departmentId: engineering.id,
    },
  });

  const vendor1 = await prisma.vendor.upsert({
    where: { id: "seed-vendor-1" },
    update: {},
    create: {
      id: "seed-vendor-1",
      name: "PT Sumber Makmur",
      contactName: "Budi Santoso",
      email: "budi@sumbermakmur.co.id",
      phone: "081234567890",
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { id: "seed-vendor-2" },
    update: {},
    create: {
      id: "seed-vendor-2",
      name: "CV Digital Kreasi",
      contactName: "Sari Wulandari",
      email: "sari@digitalkreasi.id",
      phone: "081298765432",
    },
  });

  const pm = await prisma.user.findUniqueOrThrow({ where: { email: "pm@cashnode.local" } });

  const today = new Date();
  const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000);

  const website = await prisma.project.upsert({
    where: { code: "PRJ-001" },
    update: {},
    create: {
      name: "Revamp Website Perusahaan",
      code: "PRJ-001",
      description: "Pembaruan tampilan dan infrastruktur website korporat.",
      status: "ACTIVE",
      departmentId: engineering.id,
      startDate: daysAgo(40),
      endDate: daysAgo(-20),
      initialBudget: 150000000,
    },
  });

  await prisma.budgetRevision.upsert({
    where: { id: "seed-revision-1" },
    update: {},
    create: {
      id: "seed-revision-1",
      projectId: website.id,
      amount: 20000000,
      reason: "Penambahan modul integrasi pembayaran",
      createdById: pm.id,
    },
  });

  const expenseSeeds = [
    { id: "seed-expense-1", vendorId: vendor1.id, amount: 45000000, description: "Jasa desain UI/UX", daysAgo: 30 },
    { id: "seed-expense-2", vendorId: vendor2.id, amount: 60000000, description: "Pengembangan frontend & backend", daysAgo: 18 },
    { id: "seed-expense-3", vendorId: vendor1.id, amount: 25000000, description: "Lisensi hosting & domain tahunan", daysAgo: 5 },
  ];
  for (const e of expenseSeeds) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        projectId: website.id,
        vendorId: e.vendorId,
        userId: pm.id,
        amount: e.amount,
        description: e.description,
        expenseDate: daysAgo(e.daysAgo),
        receiptUrl: "/uploads/receipts/seed-placeholder.pdf",
      },
    });
  }

  await prisma.project.upsert({
    where: { code: "PRJ-002" },
    update: {},
    create: {
      name: "Kampanye Peluncuran Produk",
      code: "PRJ-002",
      description: "Kampanye pemasaran multi-kanal untuk produk baru.",
      status: "PLANNING",
      departmentId: engineering.id,
      startDate: daysAgo(-5),
      endDate: daysAgo(-65),
      initialBudget: 80000000,
    },
  });

  console.log("Seed selesai. Login: admin@cashnode.local / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
