# Walkthrough - PostgreSQL to MySQL Database Migration and Updates

Here is a summary of the database migration to MySQL and setup instructions for the hosting.

## Changes Made

### 1. Database System Migration to MySQL
- **Modified `package.json`**: Added `"mysql2"` package.
- **Modified `drizzle.config.ts`**: Changed dialect to `"mysql"`.
- **Refactored `schema.ts`**: Changed Drizzle table wrapper from `pgTable` to `mysqlTable` and adapted column structures to MySQL core:
  - Replaced postgres serial integers with `.autoincrement()`.
  - Replaced PG uniques with `varchar` length limits.
  - Replaced `jsonb` with `json` columns.
  - Replaced postgres specific `withTimezone: true` timestamps.
- **Refactored database clients**: Changed the database connections from `postgres` client to `mysql2/promise` connection pool in both `src/lib/db/index.ts` and the seed script `src/lib/db/seed.ts`.
- **Adapted ORM Queries**: Changed PG-specific operations like `.returning()`, `.onConflictDoUpdate()` and `ILIKE` case-insensitive queries to MySQL alternatives (`.insertId`, `.onDuplicateKeyUpdate()`, and `LIKE`).
- **Verified compilation**: Run `npm run check` and resolved all type issues. The application builds cleanly with **0 errors**.

---

## DirectAdmin MySQL Setup Instructions

Follow these updated steps in your hosting terminal to run the application using your newly created MySQL database (`mapflofa927_main`):

### 1. Buka Terminal DirectAdmin
Klik tombol **Terminal** di bawah bagian **SYSTEM INFO & FILES** pada halaman DirectAdmin Anda.

### 2. Update File Konfigurasi `.env`
Buka file `.env` di dalam folder project Anda di server hosting:
```bash
nano .env
```
Ubah/tambahkan baris `DATABASE_URL` menggunakan format URL MySQL berikut:
```env
DATABASE_URL="mysql://mapflofa927_main:Xxmz5j7bFTwyvpnwRn4w@127.0.0.1/mapflofa927_main"
PORT=3000
HOST=127.0.0.1
BOOTSTRAP_ADMIN_EMAIL="admin@mapflofa.com"
BOOTSTRAP_ADMIN_PASSWORD="GantiDenganPasswordBaruAnda"
BOOTSTRAP_ADMIN_NAME="Administrator"
```
*Tekan `CTRL + O`, lalu `Enter` untuk menyimpan, lalu `CTRL + X` untuk keluar.*

### 3. Jalankan Pull & Build di Terminal
Unduh update kode terbaru yang telah saya buat ini, kemudian pasang dependensi baru (`mysql2`) dan buat tabel-tabel di database hosting Anda:
```bash
# Tarik update kode terbaru dari github
git pull origin main

# Instal library mysql2 yang baru ditambahkan
npm install

# Push struktur tabel ke database MySQL hosting Anda
npx drizzle-kit push

# Masukkan seluruh 50 data pengurus dan berita awal ke MySQL Anda
npx tsx src/lib/db/seed.ts

# Build ulang project untuk production
npm run build
```

### 4. Restart Server Node.js (PM2)
Terakhir, jalankan ulang server Node.js agar menggunakan file build baru:
```bash
pm2 restart mapflofa-web || pm2 start build/index.js --name "mapflofa-web"
```
Aplikasi Anda kini sepenuhnya berjalan di atas database MySQL lokal hosting Anda sendiri!
