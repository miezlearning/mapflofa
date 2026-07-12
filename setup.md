# Panduan Setup & Deploy Website MAPFLOFA (MySQL)

Panduan ini berisi langkah-langkah lengkap untuk melakukan setup dan deploy aplikasi website SvelteKit MAPFLOFA menggunakan database **MySQL** bawaan hosting DirectAdmin Anda.

---

## 📋 Prasyarat Awal (Hosting DirectAdmin)
Sebelum memulai, pastikan database MySQL Anda sudah dibuat pada control panel DirectAdmin dengan detail berikut:
*   **Database Name:** `mapflofa927_main`
*   **Database User:** `mapflofa927_main`
*   **Password:** `Xxmz5j7bFTwyvpnwRn4w`
*   **Hostname:** `127.0.0.1` (atau `localhost`)

---

## 💻 Langkah 1: Push Update dari Komputer Lokal (Local PC)
Buka git bash / VS Code terminal di PC lokal Anda, lalu kirim perubahan migrasi MySQL ini ke GitHub:
```bash
git add .
git commit -m "chore: migrate database system to mysql"
git push origin main
```

---

## 🌐 Langkah 2: Setup di Terminal Hosting (DirectAdmin)
1. Masuk ke dasbor DirectAdmin Anda.
2. Di bawah bagian **SYSTEM INFO & FILES**, klik ikon **Terminal**.
3. Jalankan perintah di bawah ini secara berurutan:

### A. Clone & Konfigurasi Lingkungan (`.env`)
```bash
# Masuk ke folder home, lalu clone repositori (jika belum ada)
git clone https://github.com/miezlearning/mapflofa.git
cd mapflofa

# Buat file konfigurasi .env
nano .env
```
Salin dan tempel konfigurasi berikut ke dalam berkas `.env` (sesuaikan admin password sesuai keinginan Anda):
```env
DATABASE_URL="mysql://mapflofa927_main:Xxmz5j7bFTwyvpnwRn4w@127.0.0.1/mapflofa927_main"
PORT=3000
HOST=127.0.0.1
BOOTSTRAP_ADMIN_EMAIL="admin@mapflofa.com"
BOOTSTRAP_ADMIN_PASSWORD="GantiDenganPasswordBaruAnda123"
BOOTSTRAP_ADMIN_NAME="Administrator"
```
*Catatan Editor `nano`: Tekan `CTRL + O`, lalu `Enter` untuk menyimpan. Tekan `CTRL + X` untuk keluar.*

---

### B. Pasang Library & Seed Database
```bash
# 1. Unduh kode terbaru dari GitHub (jika sebelumnya sudah clone)
git pull origin main

# 2. Pasang library baru (termasuk driver mysql2)
npm install

# 3. Buat seluruh tabel di database MySQL Anda secara otomatis
npx drizzle-kit push

# 4. Masukkan data 50 pengurus awal, berita, & konten profil ke database
npx tsx src/lib/db/seed.ts
```

---

### C. Build & Jalankan dengan PM2 (Background Process)
Agar server web SvelteKit Anda tetap menyala terus di latar belakang meskipun terminal ditutup:
```bash
# 1. Build aplikasi ke versi produksi
npm run build

# 2. Pasang process manager PM2 secara global di hosting Anda
npm install -g pm2

# 3. Jalankan server Node.js MAPFLOFA
pm2 start build/index.js --name "mapflofa-web"

# 4. Simpan status PM2 agar berjalan otomatis jika server restart
pm2 save
```

---

## 🔗 Langkah 3: Menghubungkan ke Domain Utama (`mapflofa.com`)
Untuk mengarahkan pengunjung website Anda dari port default HTTP (80) ke server Node.js SvelteKit yang berjalan di port `3000`:

1. Kembali ke dasbor DirectAdmin, lalu klik **File Manager**.
2. Masuk ke folder **`public_html`**.
3. Buat file baru bernama **`.htaccess`** (jika belum ada).
4. Klik kanan berkas `.htaccess`, pilih **Edit**, lalu masukkan baris kode berikut:
   ```apache
   DirectoryIndex disabled
   RewriteEngine On
   RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
   ```
5. Simpan file tersebut.

---

## 🛠️ Perintah Berguna Saat Update di Masa Depan
Jika suatu saat Anda melakukan pembaruan/coding baru pada website di komputer lokal dan ingin mengupdate di hosting:
1. Lakukan `git push` dari komputer lokal Anda.
2. Buka **Terminal** DirectAdmin, lalu ketik:
   ```bash
   cd mapflofa
   git pull origin main
   npm install
   npm run build
   pm2 restart mapflofa-web
   ```
