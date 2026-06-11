# Onboarding — SMP 1 Anggana

Panduan setup dari nol untuk anggota tim baru. Selesai dalam ~10 menit kalau Postgres dan Node sudah terpasang.

## TL;DR (cara cepat)

```sh
git clone <repo-url>
cd sveltekit_modern_school_profile
cp .env.example .env        # lalu isi DATABASE_URL + API_ADMIN_TOKEN
npm install
createdb -U postgres school_profile  # atau lewat pgAdmin / DBeaver
npm run db:push
npm run db:seed
npm run dev
```

Buka `http://localhost:5173`. Login admin di `/admin/login` pakai kredensial dari `BOOTSTRAP_ADMIN_*` di `.env`.

---

## 1. Prasyarat

| Tool | Versi minimum | Cek |
| ---- | ------------- | --- |
| Node.js | 20.x | `node -v` |
| npm | 10+ | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |
| Git | apa saja | `git --version` |

PostgreSQL bisa dari [postgresql.org/download](https://www.postgresql.org/download/) (Windows/macOS), atau Docker:

```sh
docker run -d --name pg-school -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=school_profile \
  postgres:16
```

## 2. Clone & install

```sh
git clone <repo-url>
cd sveltekit_modern_school_profile
npm install
```

`npm install` otomatis menjalankan `svelte-kit sync` lewat hook `prepare`.

## 3. Konfigurasi `.env`

Salin template dan isi:

```sh
cp .env.example .env
```

Kemudian buka `.env`, isi tiga bagian:

### a) `DATABASE_URL`

Arahkan ke Postgres lokal Anda. Default kalau pakai instalasi Postgres standar:

```
DATABASE_URL="postgres://postgres:<password-anda>@localhost:5432/school_profile"
```

Kalau password Anda mengandung karakter spesial (`@`, `:`, `/`, `#`), URL-encode dulu — contoh `p@ss` jadi `p%40ss`.

### b) `API_ADMIN_TOKEN`

Token bearer untuk endpoint write `/api/*` (selain dashboard). Generate token kuat — minimal 16 karakter:

```sh
# PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

# bash / macOS
openssl rand -base64 36
```

Tempel hasilnya ke `API_ADMIN_TOKEN="..."`.

### c) Bootstrap admin pertama

```env
BOOTSTRAP_ADMIN_EMAIL="admin@smp1anggana.local"
BOOTSTRAP_ADMIN_PASSWORD="GantiPasswordIniKuat!"
BOOTSTRAP_ADMIN_NAME="Administrator"
```

Akun ini hanya dibuat sekali oleh `npm run db:seed`. Setelah login pertama, ganti password lewat `/admin/account` dan kelola user lain di `/admin/users`.

## 4. Buat database

Kalau pakai Postgres lokal, pastikan database `school_profile` ada:

```sh
createdb -U postgres school_profile
```

Kalau `createdb` tidak ditemukan di terminal Windows, tambahkan `C:\Program Files\PostgreSQL\16\bin` ke PATH atau pakai psql:

```sh
psql -U postgres -c "CREATE DATABASE school_profile;"
```

Atau via GUI (pgAdmin / DBeaver / TablePlus) — bikin database baru bernama `school_profile`.

## 5. Apply schema + seed

```sh
npm run db:push   # bikin semua tabel
npm run db:seed   # isi data contoh + buat akun admin pertama
```

`db:push` aman dijalankan ulang — Drizzle hanya apply diff. `db:seed` **menghapus isi tabel resource** (programs, news, events) lalu memasukkan ulang data contoh; **tidak menghapus** users/sessions/audit_logs/page_views.

## 6. Jalankan dev server

```sh
npm run dev
```

Akses:

| URL | Konten |
| --- | ------ |
| `http://localhost:5173/` | Landing page |
| `http://localhost:5173/berita` | Daftar berita |
| `http://localhost:5173/berita/<slug>` | Detail berita |
| `http://localhost:5173/docs` | API docs interaktif |
| `http://localhost:5173/admin/login` | Login dashboard |
| `http://localhost:5173/admin` | Dashboard (analytics, CRUD, user management, audit log) |

## 7. Verifikasi

```sh
npm run check        # type-check (0 error/warn yang diharapkan)
npm run db:studio    # buka Drizzle Studio buat browse data di GUI
```

Login dashboard pakai email + password dari `BOOTSTRAP_ADMIN_*`. Kamu akan diarahkan ke `/admin` overview yang menampilkan jumlah konten + traffic 30 hari.

---

## Troubleshooting

### "createdb: not recognized"

PostgreSQL bin folder belum di PATH. Di Windows tambahkan `C:\Program Files\PostgreSQL\16\bin`. Restart terminal setelah.

### "password authentication failed for user 'postgres'"

Password di `DATABASE_URL` salah. Kalau lupa password Postgres, lihat [postgresql.org/docs](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html) untuk reset via `pg_hba.conf` (sementara set `trust` lokal, lalu `ALTER USER`, lalu kembalikan ke `scram-sha-256`).

### "Module '$env/static/private' has no exported member 'DATABASE_URL'"

`.env` belum dibuat atau `DATABASE_URL` belum diisi. Salin lagi dari `.env.example`, isi, lalu jalankan `npx svelte-kit sync`.

### `npm run db:push` minta truncate

Kalau Drizzle bilang akan hilangkan data karena perubahan schema, baca **[docs/SYNC.md](docs/SYNC.md)** untuk langkah aman saat pull update yang ada migration.

### Port 5173 sudah dipakai

```sh
npm run dev -- --port 5174
```

Atau cari proses yang memakai port itu dan stop.

### Image upload 401

Endpoint `POST /api/uploads` butuh `API_ADMIN_TOKEN` ATAU session admin. Pastikan login dulu di `/admin/login` kalau pakai dari editor news, atau kirim header `Authorization: Bearer <token>` kalau via script.

---

## Setelah onboarding berhasil

- Baca [README.md](README.md) untuk konteks fitur lengkap (API, dashboard, editor news, dark mode).
- Pelajari [docs/SYNC.md](docs/SYNC.md) untuk workflow saat pull dari teammate.
- Saat menambah resource baru atau ubah schema, ikuti pola di `src/lib/db/schema.ts` → `src/lib/server/repositories/<name>.ts` → `src/lib/server/api/schemas/<name>.ts` → `src/routes/api/<name>/`.
- Daftarkan resource ke `src/lib/server/admin/resources.ts` (auto-mount di dashboard) dan `src/lib/server/api/registry.ts` (auto-render di `/docs`).
