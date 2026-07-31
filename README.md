# CashNode

Enterprise Project Cost Management — sistem internal untuk memonitor anggaran dan pengeluaran proyek perusahaan secara presisi, lengkap dengan audit trail, hak akses berlapis (RBAC), manajemen vendor, serta analitik prediktif (burn-rate forecasting).

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Database & ORM:** MySQL + Prisma 7 (driver adapter `@prisma/adapter-mariadb`)
- **Auth:** NextAuth.js (Auth.js) v5 — credentials login dengan RBAC
- **UI:** Tailwind CSS v4 + Shadcn UI (tema hijau, mendukung dark mode)
- **Visualisasi Data:** Recharts
- **Export:** jsPDF + jspdf-autotable (PDF), CSV native
- **Storage:** simulasi API lokal untuk lampiran struk (`app/api/upload`)

## Fitur Utama

- **RBAC & Isolasi Data** — Admin & Finance melihat semua proyek; PM hanya melihat/menginput proyek di departemennya sendiri
- **Manajemen Proyek & Revisi Anggaran** — anggaran proyek berbentuk adendum (Anggaran Awal + Total Revisi = Total Anggaran), bukan ditimpa
- **Pengeluaran & Lampiran** — setiap pengeluaran wajib vendor + lampiran struk, dengan audit log otomatis untuk perubahan/hapus
- **Export Laporan** — CSV mentah dan PDF Report per proyek (anggaran, pengeluaran, vendor, riwayat)
- **Dashboard Analitik** — perbandingan anggaran vs pengeluaran per proyek, peringatan ambang batas (60/85/100%), dan forecasting burn-rate harian
- **Manajemen Pengguna** — Admin dapat membuat, mengedit, menonaktifkan, dan menghapus akun pengguna

## Prasyarat

- Node.js 20+
- Server MySQL (mis. XAMPP/MariaDB) yang berjalan secara lokal

## Memulai

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env` dan sesuaikan koneksi database:

   ```env
   DATABASE_URL="mysql://root@localhost:3306/cashnode"
   AUTH_SECRET="ganti-dengan-secret-acak-32-byte"
   ```

3. Buat database (jika belum ada) lalu jalankan migrasi:

   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS cashnode;"
   npx prisma migrate dev
   ```

4. Isi data awal (departemen, vendor, dan akun contoh):

   ```bash
   npm run db:seed
   ```

5. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Akun Contoh (setelah seed)

Semua akun menggunakan password `password123`.

| Email | Role | Departemen |
|---|---|---|
| `admin@cashnode.local` | Admin | – |
| `finance@cashnode.local` | Finance | – |
| `pm@cashnode.local` | Project Manager | Engineering |

## Skrip

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build production |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan ESLint |
| `npm run db:seed` | Mengisi data awal ke database |

## Struktur Proyek

```
app/
  (app)/            # Halaman terautentikasi: dashboard, proyek, departemen, vendor, pengguna
  api/upload/        # Simulasi storage lokal untuk lampiran struk
  api/auth/           # Route handler NextAuth
  login/              # Halaman login
prisma/
  schema.prisma       # Skema database
  seed.ts              # Data awal
lib/                   # Prisma client, RBAC, audit log, format, forecasting, dll.
components/             # Komponen UI bersama (Shadcn + komponen kustom)
```
