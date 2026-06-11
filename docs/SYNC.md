# Sync Workflow

Panduan saat **pull update dari teammate**. Tidak setiap pull butuh semua langkah — ikuti checklist di bawah.

## Pull cepat (no schema change)

```sh
git pull
npm install   # cuma kalau package.json berubah
npm run dev
```

Selesai. Skip ke "Verifikasi" di bawah.

---

## Checklist saat pull berisi banyak perubahan

Cek apa yang berubah:

```sh
git pull
git diff HEAD@{1} HEAD --stat
```

Lalu jalankan langkah berikut **sesuai apa yang berubah**:

### 1. `package.json` atau `package-lock.json` berubah

Ada dependency baru:

```sh
npm install
```

### 2. `.env.example` berubah

Ada env variable baru atau lama dihapus. Bandingkan:

```sh
git diff HEAD@{1} HEAD -- .env.example
```

Tambahkan key baru ke `.env` lokal kamu (file ini tidak dikomit, jadi tidak otomatis ter-update). Tanpa env yang lengkap, server bisa gagal start dengan error `$env/static/private` atau crash saat akses fitur baru.

### 3. `src/lib/db/schema.ts` berubah (schema DB)

**Penting** — tabel atau kolom berubah. Cek diff:

```sh
git diff HEAD@{1} HEAD -- src/lib/db/schema.ts
```

Kemudian apply ke database:

```sh
npm run db:push
```

Drizzle akan tampilkan diff dan minta konfirmasi kalau ada operasi destruktif (drop column, drop table). **Baca pesan-nya teliti**:

| Pesan | Aman? | Aksi |
| ----- | ----- | ---- |
| `[✓] Changes applied` (langsung) | Aman | Selesai |
| `Add column` | Aman | Drizzle apply |
| `Add unique constraint` | Aman kalau data baru | Pilih "no, add constraint without truncating" kalau yakin data tidak melanggar; "yes, truncate" kalau dev-only |
| `Drop column X` | **Hati-hati** | Konfirmasi data column itu sudah tidak dibutuhkan; backup dulu kalau perlu |
| `Drop table X` | **Hati-hati** | Sama seperti di atas |

Kalau ragu, ke step berikutnya pakai migration files instead of `db:push`:

```sh
npm run db:generate   # bikin file SQL migration
# review file di ./drizzle/<timestamp>_*.sql
npm run db:migrate    # apply
```

### 4. Ada migration file baru di `./drizzle/`

Teammate pakai `db:generate` (bukan `db:push`). Apply migration tanpa interaktif:

```sh
npm run db:migrate
```

### 5. Tabel `news`, `programs`, atau `events` ada perubahan struktur

Setelah `db:push` atau `db:migrate`, data lama mungkin tidak konsisten dengan kolom baru. Re-seed kalau di lokal dev:

```sh
npm run db:seed
```

`db:seed` reset isi tabel resource saja (TIDAK reset users / sessions / audit_logs / page_views). Akun admin pertama tidak di-overwrite.

### 6. Tabel `users` / `sessions` / `audit_logs` / `page_views` berubah

Itu jarang. Kalau terjadi:

- Apply schema lewat `npm run db:push` atau migration
- **Jangan** re-seed — itu tidak menyentuh tabel auth/audit/analytics
- Sessions kamu mungkin tidak valid lagi (kalau struktur session berubah). Logout di `/admin/login` lalu login ulang.

### 7. `src/lib/server/api/registry.ts` berubah

Endpoint API baru atau berubah. Tidak butuh aksi DB — cukup `npm run dev` ulang. Endpoint baru langsung muncul di `/docs`.

### 8. `src/lib/server/admin/resources.ts` berubah

Resource admin baru. Tidak butuh aksi DB di luar yang sudah disebut di poin 3. Halaman dashboard `/admin/<resource>` otomatis tersedia.

### 9. File di `static/uploads/` di-commit (seharusnya tidak)

`.gitignore` sudah block `static/uploads/*`. Kalau tetap ada file ke-commit, abaikan; lokal tidak terpengaruh.

---

## Verifikasi setelah sync

```sh
npm run check        # 0 error, 0 warning expected
npm run dev
```

Buka `http://localhost:5173`:

- Landing harus render dengan data yang konsisten
- `/admin/login` → masuk pakai kredensial admin lokal kamu
- `/admin` overview load tanpa error 500 (kalau ada column hilang yang dipakai analytics, akan crash di sini — re-run `db:push`)

Kalau pernah error di console seperti `column "..." does not exist`, schema lokal kamu belum sinkron. Jalankan `npm run db:push` lagi.

---

## Conflict di branch kamu sendiri (saat rebase)

Kalau kamu lagi di branch sendiri dan rebase ke `main`:

1. Selesaikan conflict di code (file `.svelte`, `.ts`, dll) seperti biasa
2. Kalau `src/lib/db/schema.ts` ikut conflict → resolve dulu, lalu jalankan `npm run db:push` di lokal
3. Jangan commit `.env`. Jangan commit isi `static/uploads/`.

---

## Skenario umum

### "Saya pull, sekarang dashboard error"

```sh
npm install
npm run db:push
npm run dev
```

90% kasus selesai. Kalau masih error, cek `git log -- src/lib/db/schema.ts` untuk lihat perubahan schema terakhir.

### "Saya sudah seeded, sekarang teammate add kolom baru — data lama hilang?"

`db:push` tidak menghapus baris saat add column biasa. Kolom baru jadi `NULL` atau `default` value. Re-seed kalau perlu data contoh terisi kolom baru.

### "Saya mau test dengan database fresh"

```sh
psql -U postgres -c "DROP DATABASE school_profile;"
psql -U postgres -c "CREATE DATABASE school_profile;"
npm run db:push
npm run db:seed
```

Hati-hati: ini hapus **semua data** termasuk users, sessions, audit logs, page views.

### "Saya ingin sinkron data konten dari production / staging"

Itu bukan job `db:seed`. Pakai `pg_dump` di server source dan `psql` di lokal:

```sh
pg_dump -h prod-host -U prod-user prod-db > backup.sql
psql -U postgres -d school_profile < backup.sql
```

Strip kolom sensitif (passwords, audit logs) sebelum import kalau perlu.
