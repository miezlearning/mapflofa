# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## 🆕 Anggota tim baru?

Mulai dari **[ONBOARDING.md](ONBOARDING.md)** — setup dari nol selesai dalam ~10 menit.

## 🔄 Habis pull dari teammate?

Lihat **[docs/SYNC.md](docs/SYNC.md)** — checklist langkah sinkronisasi sesuai apa yang berubah (deps, env, schema DB, migration).

## ⚡ Shortcut

| Perintah | Kapan dipakai |
| -------- | ------------- |
| `npm run setup` | Pertama kali — install deps + push schema + seed data contoh + bootstrap admin |
| `npm run sync`  | Setelah `git pull` — install deps baru + apply schema diff |
| `npm run dev`   | Jalankan dev server |
| `npm run check` | Type-check seluruh project |

---

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --add tailwindcss="plugins:none" --install npm poke-page
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Database (Postgres + Drizzle ORM)

Project ini pakai **PostgreSQL** sebagai database dan **Drizzle ORM** untuk schema, migration, dan query. Skema-nya ada di `src/lib/db/schema.ts` dengan tiga tabel: `programs`, `news`, dan `events`.

### 1. Install PostgreSQL

Download dari [postgresql.org/download](https://www.postgresql.org/download/) lalu install. Saat instalasi, set password untuk user `postgres` — **simpan password ini**, dipakai di langkah berikutnya.

Setelah install, pastikan binary Postgres ada di PATH (`createdb`, `psql`, dll). Di Windows, biasanya:

```
C:\Program Files\PostgreSQL\16\bin
```

Tambahkan folder itu ke environment variable `Path` (User), lalu **buka terminal baru** supaya PATH ter-refresh.

Verifikasi:

```sh
psql --version
```

### 2. Buat database

```sh
createdb -U postgres school_profile
```

Akan diminta password user `postgres`.

> Lupa password? Edit `pg_hba.conf` (di `C:\Program Files\PostgreSQL\16\data\pg_hba.conf` di Windows), ganti `scram-sha-256` jadi `trust` di baris IPv4/IPv6 local, restart service Postgres (`Restart-Service postgresql-x64-16` di PowerShell as Administrator), masuk pakai `psql -U postgres`, jalankan `ALTER USER postgres WITH PASSWORD 'baru';`, lalu **balikin** `pg_hba.conf` ke `scram-sha-256` dan restart sekali lagi.

### 3. Konfigurasi `.env`

Salin `.env.example` jadi `.env`, lalu isi `DATABASE_URL`:

```env
DATABASE_URL="postgres://postgres:PASSWORDMU@localhost:5432/school_profile"
```

Kalau password mengandung karakter spesial (`@`, `:`, `/`, `#`, dll.), URL-encode dulu — contoh `p@ss` jadi `p%40ss`.

Setelah `.env` terisi, jalankan sekali:

```sh
npx svelte-kit sync
```

biar SvelteKit regenerate tipe untuk `$env/static/private` (kalau lupa, TypeScript akan komplain `Module '"$env/static/private"' has no exported member 'DATABASE_URL'`).

### 4. Push schema ke database

```sh
npm run db:push
```

Ini bikin tabel `programs`, `news`, dan `events` di database `school_profile`. Pakai ini untuk development cepat. Kalau mau migration files yang ter-version (cocok untuk production), gunakan:

```sh
npm run db:generate    # bikin SQL migration di folder ./drizzle
npm run db:migrate     # apply migration ke database
```

### 5. Seed data awal

```sh
npm run db:seed
```

Script di `src/lib/db/seed.ts` akan **menghapus isi tabel** lalu memasukkan data contoh (programs, news, events). Aman dijalankan ulang kapan pun saat development.

### 6. Inspeksi data (opsional)

```sh
npm run db:studio
```

Buka Drizzle Studio di browser untuk lihat dan edit isi tabel secara visual.

### Struktur folder

```
src/lib/db/
├── schema.ts   # definisi tabel + tipe TypeScript
├── index.ts    # client Drizzle (import { db } from '$lib/db')
└── seed.ts     # script seed data awal
```

Pakai client-nya dari `+page.server.ts` / `+layout.server.ts` / `+server.ts`:

```ts
import { db } from '$lib/db';
import { programs } from '$lib/db/schema';

export const load = async () => {
  const rows = await db.select().from(programs);
  return { programs: rows };
};
```

### Script ringkas

| Perintah              | Fungsi                                         |
| --------------------- | ---------------------------------------------- |
| `npm run db:push`     | Sync schema langsung ke DB (dev workflow)      |
| `npm run db:generate` | Generate SQL migration ke `./drizzle`          |
| `npm run db:migrate`  | Apply migration files ke DB                    |
| `npm run db:seed`     | Reset & isi tabel dengan data contoh           |
| `npm run db:studio`   | Buka Drizzle Studio (UI buat lihat/edit data)  |

## API

REST endpoint dipasang di bawah `/api/*` dan dijalankan oleh SvelteKit server. Semua respons memakai envelope JSON yang konsisten:

```json
// success
{ "ok": true, "data": ... }

// failure
{ "ok": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": {} } }
```

### Keamanan

| Lapis              | Implementasi                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Auth (write)       | Bearer token via header `Authorization: Bearer <API_ADMIN_TOKEN>`. Compare constant-time.          |
| Validasi           | Zod schema per resource — semua input divalidasi dan di-trim, URL wajib `http(s)`.                 |
| Body limit         | 32 KB per request. Ketolak `413` kalau lebih.                                                      |
| Content-Type       | Wajib `application/json` untuk write. Ketolak `415` kalau bukan.                                   |
| Rate limit         | Per-IP per-endpoint. Default: read 120/menit, write 20/menit. Header `X-RateLimit-*`.              |
| Method whitelist   | Hooks server menolak metode HTTP di luar daftar resmi sebelum mencapai handler.                    |
| Headers            | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cache-Control: no-store`. |
| Error handling     | Error internal di-log server-side, client hanya menerima pesan generik (no leak).                  |

Set `API_ADMIN_TOKEN` di `.env` (minimal 16 karakter). Generate token kuat di PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Endpoint: `programs`

| Method | Path                  | Auth  | Deskripsi                              |
| ------ | --------------------- | ----- | -------------------------------------- |
| GET    | `/api/programs`       | publik | List program, support pagination + filter |
| GET    | `/api/programs/:id`   | publik | Ambil satu program by id               |
| POST   | `/api/programs`       | admin | Buat program baru                      |
| PATCH  | `/api/programs/:id`   | admin | Update sebagian field program          |
| DELETE | `/api/programs/:id`   | admin | Hapus program                          |

#### Query params untuk list

| Param    | Tipe   | Default | Catatan                                       |
| -------- | ------ | ------- | --------------------------------------------- |
| `limit`  | int    | 20      | 1–100                                         |
| `offset` | int    | 0       | Untuk pagination                              |
| `tag`    | string | -       | Filter exact-match tag                        |
| `q`      | string | -       | Pencarian case-insensitive di title + excerpt |

#### Body untuk create / update

```ts
{
  title:   string,        // 1-160 char
  tag:     string,        // 1-60 char
  excerpt: string,        // 1-500 char
  image:   string,        // URL http(s), max 2048 char
  post?:   string | null  // optional, max 20000 char
}
```

`PATCH` menerima subset field yang sama (minimal salah satu harus dikirim).

#### Contoh pakai

```sh
# List
curl http://localhost:5173/api/programs

# List dengan filter
curl "http://localhost:5173/api/programs?tag=Akademik&limit=5"

# Detail
curl http://localhost:5173/api/programs/1

# Create (butuh token admin)
curl -X POST http://localhost:5173/api/programs `
  -H "Authorization: Bearer $env:API_ADMIN_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"title":"Klub Robotik","tag":"Teknologi","excerpt":"...","image":"https://example.com/x.jpg"}'

# Update
curl -X PATCH http://localhost:5173/api/programs/1 `
  -H "Authorization: Bearer $env:API_ADMIN_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"excerpt":"Deskripsi baru"}'

# Delete
curl -X DELETE http://localhost:5173/api/programs/1 `
  -H "Authorization: Bearer $env:API_ADMIN_TOKEN"
```

### Struktur folder API

```
src/
├── hooks.server.ts                  # method allowlist + global security headers
├── lib/server/
│   ├── api/
│   │   ├── auth.ts                  # bearer token check (constant-time)
│   │   ├── parse.ts                 # JSON body reader + ID parser + body limit
│   │   ├── rate-limit.ts            # in-memory per-IP rate limiter
│   │   ├── response.ts              # ok() / fail() / ApiError helpers
│   │   ├── schemas/
│   │   │   ├── programs.ts          # Zod schemas — programs
│   │   │   ├── news.ts              # Zod schemas — news
│   │   │   └── events.ts            # Zod schemas — events
│   └── repositories/
│       ├── programs.ts              # Drizzle queries — programs
│       ├── news.ts                  # Drizzle queries — news
│       └── events.ts                # Drizzle queries — events
└── routes/api/
    ├── programs/
    │   ├── +server.ts                # GET (list), POST
    │   └── [id]/+server.ts           # GET, PATCH, DELETE
    ├── news/
    │   ├── +server.ts                # GET (list), POST
    │   └── [id]/+server.ts           # GET, PATCH, DELETE
    └── events/
        ├── +server.ts                # GET (list), POST
        └── [id]/+server.ts           # GET, PATCH, DELETE
```

### Endpoint: `news`

| Method | Path                | Auth   | Deskripsi                                           |
| ------ | ------------------- | ------ | --------------------------------------------------- |
| GET    | `/api/news`         | publik | List berita, support pagination + filter            |
| GET    | `/api/news/:id`     | publik | Ambil satu berita by id                             |
| POST   | `/api/news`         | admin  | Buat berita baru                                    |
| PATCH  | `/api/news/:id`     | admin  | Update sebagian field berita                        |
| DELETE | `/api/news/:id`     | admin  | Hapus berita                                        |

#### Query params untuk list

| Param      | Tipe   | Default | Catatan                                       |
| ---------- | ------ | ------- | --------------------------------------------- |
| `limit`    | int    | 20      | 1–100                                         |
| `offset`   | int    | 0       | Untuk pagination                              |
| `category` | string | -       | Filter exact-match category                   |
| `q`        | string | -       | Pencarian case-insensitive di title + excerpt |

#### Body untuk create / update

```ts
{
  category: string,   // 1-60 char
  date:     string,   // 1-40 char, format human, mis. "12 Mei 2026"
  title:    string,   // 1-200 char
  excerpt:  string,   // 1-500 char
  image:    string    // URL http(s), max 2048 char
}
```

`PATCH` menerima subset field yang sama (minimal salah satu harus dikirim).

### Endpoint: `events`

| Method | Path                | Auth   | Deskripsi                              |
| ------ | ------------------- | ------ | -------------------------------------- |
| GET    | `/api/events`       | publik | List acara, support pagination + filter |
| GET    | `/api/events/:id`   | publik | Ambil satu acara by id                 |
| POST   | `/api/events`       | admin  | Buat acara baru                        |
| PATCH  | `/api/events/:id`   | admin  | Update sebagian field acara            |
| DELETE | `/api/events/:id`   | admin  | Hapus acara                            |

#### Query params untuk list

| Param    | Tipe   | Default | Catatan                                       |
| -------- | ------ | ------- | --------------------------------------------- |
| `limit`  | int    | 20      | 1–100                                         |
| `offset` | int    | 0       | Untuk pagination                              |
| `q`      | string | -       | Pencarian case-insensitive di title + excerpt |

#### Body untuk create / update

```ts
{
  date:      string,  // 1-40 char, mis. "12 Jun 2026"
  dateDay:   string,  // 1-2 digit, mis. "12" atau "02"
  dateMonth: string,  // 1-10 char, mis. "Jun", "Agu"
  title:     string,  // 1-200 char
  excerpt:   string,  // 1-500 char
  image:     string,  // URL http(s), max 2048 char
  time:      string,  // 1-40 char, mis. "08:00 WITA"
  location:  string   // 1-120 char
}
```

`PATCH` menerima subset field yang sama (minimal salah satu harus dikirim).

### Browsable docs

Tersedia dua surface untuk dokumentasi API, keduanya digenerate dari registry yang sama (`src/lib/server/api/registry.ts`):

| URL                | Tujuan                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| `/docs`            | Halaman dokumentasi interaktif (sidebar navigation, dark theme).        |
| `/docs/<resource>` | Detail tiap resource (programs, news, events) dengan tabel schema + cURL. |
| `/api/docs`        | Spec machine-readable (JSON) — list semua endpoint, auth, dan rate limit. |

Karena single source of truth, menambah/mengubah endpoint cukup edit registry — halaman `/docs/*` dan respons `/api/docs` ikut berubah otomatis.

### Cara menambah resource baru

Pola sama persis dengan `programs` / `news` / `events`:

1. Tambah file `src/lib/server/api/schemas/<name>.ts` (Zod schema).
2. Tambah file `src/lib/server/repositories/<name>.ts` (query Drizzle).
3. Tambah route `src/routes/api/<name>/+server.ts` dan `src/routes/api/<name>/[id]/+server.ts`.
4. Daftarkan resource ke `src/lib/server/api/registry.ts` agar muncul otomatis di `/docs` dan `/api/docs`.

Helper `requireAdmin`, `rateLimit`, `readJson`, `parseId`, dan `ApiError` bisa dipakai langsung tanpa duplikasi.

## Admin Dashboard

Dashboard ada di `/admin` — **tidak di-link** dari landing page atau navigasi publik dan diblokir di `robots.txt`. URL ini sengaja "hidden", dijaga di sisi server dengan session cookie HttpOnly.

### Akses pertama kali

1. Set di `.env`:
   ```
   BOOTSTRAP_ADMIN_EMAIL="admin@yourdomain.local"
   BOOTSTRAP_ADMIN_PASSWORD="GantiPasswordIni!"
   BOOTSTRAP_ADMIN_NAME="Administrator"
   ```
2. Jalankan `npm run db:seed`. Akan membuat akun admin pertama (idempotent — kalau sudah ada, akan di-skip).
3. Buka `http://localhost:5173/admin/login` dan masuk.

### Lapis keamanan

| Lapis              | Implementasi                                                                          |
| ------------------ | ------------------------------------------------------------------------------------- |
| Password storage   | Hash dengan **scrypt** (Node built-in), salt 16 byte, parameter N=16384, r=8, p=1.    |
| Login              | `verifyPassword` constant-time. Untuk akun yang tidak ada, dummy hash dijalankan agar tidak bocor lewat timing. |
| Session            | Token random 256-bit base64url di cookie `sid` (HttpOnly, SameSite=Lax, Secure di produksi). DB hanya menyimpan `sha256(token)`, jadi DB leak ≠ session leak. |
| Rolling expiry     | 30 hari, refresh otomatis tiap request bila < 29 hari tersisa.                        |
| Logout             | Hapus row session dari DB + clear cookie.                                              |
| CSRF               | SvelteKit form actions menerapkan origin check otomatis untuk POST.                   |
| URL hiding         | Tidak ada link publik. `robots.txt` Disallow `/admin/` dan `/api/`. `<meta name="robots">` di halaman admin set ke `noindex,nofollow`. |
| Role-based access  | Helper `requireUser()` dan `requireRole()` siap pakai. Saat ini hanya role `admin`, tinggal tambah `editor`/`viewer` lewat schema kapan saja. |

### Halaman dashboard

| URL                            | Fungsi                                                |
| ------------------------------ | ----------------------------------------------------- |
| `/admin/login`                 | Login form. Kalau sudah login, redirect ke `/admin`. |
| `/admin/logout`                | POST untuk hapus session. GET → redirect ke login.    |
| `/admin`                       | Overview (jumlah programs / news / events).           |
| `/admin/programs` (sama untuk `news`, `events`) | List dengan tombol **Tambah**, **Edit**, **Delete** (dengan konfirmasi inline). |
| `/admin/programs/new`          | Form create.                                          |
| `/admin/programs/:id`          | Form edit.                                            |

### Scalability

- **Resource registry**: `src/lib/server/admin/resources.ts` mendefinisikan tiap resource dengan field config + Zod schema + repository. Tambah resource baru = tambah satu entri di sini, selesai. Halaman `/admin/[resource]`, `/admin/[resource]/new`, `/admin/[resource]/:id` otomatis muncul.
- **Generic CRUD route**: route `[resource]` dynamic, jadi tidak perlu duplikasi handler per tabel.
- **Reusable form**: `ResourceForm.svelte` render kolom dari config (`text`, `textarea`, `url`, `longtext`). Validasi pakai Zod schema yang sama dengan API publik — tidak ada drift antara dashboard dan API.
- **Session di DB**: bukan in-memory, jadi siap multi-instance / behind load balancer.
- **API layer terpakai dua sisi**: dashboard panggil repo langsung (cepat); script eksternal lewat `/api/*` dengan `API_ADMIN_TOKEN`. Helper `requireAdmin()` API menerima keduanya — login dengan session admin di browser otomatis dianggap berwenang.

### Cara menambah resource baru

Sama dengan workflow API:

1. Tambah tabel di `src/lib/db/schema.ts`.
2. Tambah Zod schema di `src/lib/server/api/schemas/<name>.ts`.
3. Tambah repository di `src/lib/server/repositories/<name>.ts`.
4. Tambah route API di `src/routes/api/<name>/+server.ts` dan `[id]/+server.ts`.
5. Daftarkan ke `src/lib/server/api/registry.ts` (untuk docs).
6. **Daftarkan ke `src/lib/server/admin/resources.ts`** dengan field config — dashboard otomatis menyediakan list/new/edit/delete.

## Account, Users, dan Audit log

### `/admin/account`

Halaman profil dan keamanan untuk akun yang sedang login.

| Fitur            | Detail |
| ---------------- | ------ |
| Edit profil      | Update nama. Email tidak diubah dari sini (rotasi email biasanya butuh verifikasi terpisah). |
| Ganti password   | Wajib masukkan password lama. Password baru minimal 12 karakter. |
| Session revoke   | Setelah ganti password, semua sesi lain (perangkat lain) otomatis ter-logout. Sesi saat ini dipertahankan agar Anda tidak ditendang dari halaman. |
| Audit            | `password.change` dengan jumlah sesi yang di-revoke ikut tercatat. |

### `/admin/users` (admin only)

Manajemen akun. Halaman ini diproteksi dengan `requireRole(event, 'admin')` — role lain (editor, viewer) tidak melihat link ini di sidebar dan akan di-redirect kalau memaksa URL.

Aksi yang tersedia:

| Aksi          | Catatan keamanan |
| ------------- | ---------------- |
| Invite user   | Set nama + email + password awal + role. Konflik email = `409`. Password awal min 12 char; user wajib ganti via `/admin/account` setelah login. |
| Update role   | Inline dropdown auto-submit. Tidak bisa mengubah role akun sendiri. Tidak bisa menurunkan admin terakhir. |
| Deactivate    | Set `is_active = false` + revoke semua sesinya secara real-time. Tidak bisa menonaktifkan akun sendiri atau admin terakhir. |
| Activate      | Set kembali `is_active = true`. |

Inactive account tidak bisa login (auth menolak) dan session resolver otomatis menghapus sesi yang masih hidup.

### `/admin/audit` (admin only)

Append-only log dari aktivitas penting. Setiap entri menyimpan:

- `userEmail` + `userRole` (snapshot — tahan kalau user dihapus kemudian)
- `action` (mis. `login.success`, `password.change`, `resource.update`)
- `resource` + `resourceId` (mis. `programs#7`)
- `details` (JSON bebas, mis. `{ fields: ['title'] }`)
- `ip`, `userAgent`, `createdAt`

Halaman audit memiliki:

- Filter dropdown: User · Resource · Action (auto-populate dari nilai distinct yang sudah pernah tercatat)
- Pagination 50/halaman
- Detail JSON expandable per row
- Index DB di `(user_id, created_at)` dan `(resource, created_at)` agar filter cepat saat tabel membesar

Action yang sudah ter-instrumentasi otomatis:

| Action               | Dipicu di                            |
| -------------------- | ------------------------------------ |
| `login.success`      | login berhasil                        |
| `login.failure`      | login gagal (email yang dicoba ikut tercatat) |
| `logout`             | POST /admin/logout                    |
| `password.change`    | self-service di /admin/account        |
| `resource.create`    | tambah programs/news/events           |
| `resource.update`    | edit programs/news/events             |
| `resource.delete`    | hapus programs/news/events            |
| `user.create`        | invite user di /admin/users           |
| `user.update`        | ubah role atau profil                 |
| `user.deactivate`    | nonaktifkan akun                      |
| `user.activate`      | aktifkan kembali akun                 |

Logging dipisah ke fungsi `audit()` di `src/lib/server/audit/log.ts` sehingga tidak mengganggu logika aksi utama (kalau insert log gagal, action tetap berhasil — error hanya di-log ke server console).

## News editor (inline WYSIWYG, ala WordPress / Notion)

`/admin/news/new` dan `/admin/news/:id` membuka editor full-page yang **mereplikasi tampilan halaman publik**. Tidak ada formulir terpisah — kamu klik di area mana pun lalu mengetik langsung di tempatnya:

- **Cover image** klik kotak placeholder → dialog upload muncul. Setelah ada, hover untuk **Ganti cover** atau **Hapus cover**.
- **Kategori** dan **tanggal** di atas judul → klik untuk edit di tempat.
- **Judul** → typography raksasa, klik untuk ketik.
- **Excerpt** → klik untuk ketik ringkasan singkat (digunakan di kartu homepage).
- **Body** → contenteditable area. Tulis paragraf, atau paste/drag image untuk upload otomatis.
- **Slug** → editable di top action bar. Auto-generate dari judul sampai kamu sentuh field-nya.

### Markdown shortcuts (saat mengetik di body)

Editor mengenali pola markdown di **awal baris** dan otomatis mentransformasikannya saat Anda menekan **Space** (atau **Enter** untuk `---`):

| Ketik di awal baris       | Ditekan | Hasil           |
| ------------------------- | ------- | --------------- |
| `#`                       | Space   | Heading 1       |
| `##`                      | Space   | Heading 2       |
| `###`                     | Space   | Heading 3       |
| `####`                    | Space   | Heading 4       |
| `>`                       | Space   | Blockquote      |
| `-` atau `*`              | Space   | Bullet list     |
| `1.`                      | Space   | Numbered list   |
| `---`                     | Enter   | Horizontal rule |

Catatan: shortcut hanya aktif kalau pola benar-benar berada di awal baris dan baris masih kosong (selain pola itu). Misalnya `## ` di tengah paragraf tidak akan diubah.

### Side toolbar (always visible)

Toolbar format ada di sebelah kiri area body, sticky di posisi atas saat kamu scroll. **Tidak perlu seleksi text dulu** — tinggal klik tombol, format langsung diterapkan ke posisi cursor / seleksi yang aktif.

| Tombol | Fungsi |
| ------ | ------ |
| **B** / *I* / __U__ | Bold / italic / underline (Ctrl+B/I/U juga jalan native) |
| H2 / H3 | Heading level 2 dan 3 |
| ❝ | Toggle blockquote |
| • / 1. | Bullet list / numbered list |
| 🔗 | Insert link (browser prompt URL) |
| 📷 | Insert image (file picker; juga: paste atau drag-drop) |
| ✕ | Clear formatting |

State aktif tombol auto-update mengikuti posisi cursor (mis. cursor di dalam `<h2>` → tombol H2 highlight). Klik tombol yang sudah aktif untuk toggle off.

Di mobile (< 720px) toolbar otomatis pindah ke atas sebagai bar horizontal, masih sticky.

### Autosave draft

Setiap perubahan apa pun (title, slug, kategori, tanggal, excerpt, cover image, body content) **debounced 800ms** lalu disimpan ke `localStorage` sebagai draft. Status autosave muncul di action bar atas:

| Status         | Tampilan |
| -------------- | -------- |
| Sedang menyimpan | titik kuning berkedip + "Menyimpan…" |
| Tersimpan      | titik hijau + "Draft disimpan" (lalu fade ke abu-abu) |
| Idle           | titik abu + "Draft · 30 detik lalu" (relative time) |
| Gagal          | titik merah + "Gagal autosave" |

Saat kamu kembali ke halaman edit / new (mis. browser crash, accidental close, refresh), banner "Ada draft tersimpan dari X menit lalu. Pulihkan?" muncul di atas. Pilih **Pulihkan draft** untuk load isinya kembali, atau **Buang** untuk hapus draft dan mulai dari record asli.

Draft otomatis dihapus saat publish/save berhasil (server action redirect).

Storage key:
- `news-draft:new` untuk halaman create
- `news-draft:<id>` untuk halaman edit (per-post)

Jadi kamu bisa punya beberapa draft aktif untuk post yang berbeda secara bersamaan.

### Image upload

Tiga cara, semua otomatis upload ke `/api/uploads`, dapat URL `/uploads/<sha256>.<ext>`, lalu insert sebagai `<figure><img ...><figcaption>...</figcaption></figure>`:

1. **Tombol 📷** di bubble toolbar (saat ada seleksi atau cursor di body)
2. **Paste** image dari clipboard
3. **Drag &amp; drop** file image ke area body

### Cara kerja teknis

- Storage: HTML (bukan markdown lagi). Disanitasi server-side di-save **dan** di-render via `sanitize-html` dengan whitelist tag/atribut.
- Editor pakai `contenteditable="true"` native + `document.execCommand` untuk format. Reliable cross-browser, no library dependency.
- Sticky action bar di atas dengan tombol Cancel/Preview/Publish-Save.
- Form action SvelteKit standar — semua field tersinkron ke hidden input saat submit, sehingga progressive enhancement tetap jalan.

### Public detail

`/berita/:slug` masih sama — render HTML yang sudah disanitasi server-side.

### Image upload pipeline

`POST /api/uploads` (admin auth, 30 req/menit, multipart/form-data):

| Validasi              | Detail |
| --------------------- | ------ |
| Auth                  | Bearer token atau session admin (sama dengan endpoint write lain) |
| MIME whitelist        | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Magic-byte sniff      | Validasi header file 4–12 byte pertama, ngga trust client-declared MIME |
| Size limit            | 5 MB |
| Filename              | sha256 dari isi file → idempotent (upload yang sama 2x → URL sama, tanpa duplikat) |
| Storage               | `static/uploads/<hash>.<ext>`, langsung di-serve di `/uploads/<hash>.<ext>` oleh SvelteKit |
| Migrasi nanti         | Tinggal swap `src/lib/server/storage.ts` ke S3/R2; API surface sama |

Audit log otomatis tercatat (`resource: 'uploads'`).

## Dashboard analytics

Tabel `page_views` tracking kunjungan publik dengan privacy-first:

- **Tidak ada raw IP** disimpan. `visitor_hash = sha256(ip + ua + dailyKey + processSalt)`.
- Salt baru tiap restart proses, jadi hash lama ngga bisa di-rebuild walau full DB + code bocor.
- Bot UA otomatis di-skip (`googlebot`, `whatsapp`, `telegrambot`, dll).
- Endpoint `/admin` dan `/api/*` ngga ditrack.

Helper `recordPageView(event, path)` dipanggil **fire-and-forget** dari `+page.server.ts` halaman publik. Sudah aktif di:

- `/` (homepage)
- `/berita/:slug` (detail berita)

Tambah halaman publik baru? Cukup `import { recordPageView } from '$lib/server/analytics/track';` lalu panggil di load function.

### Halaman overview `/admin`

Menampilkan:

- 3 tile content count (programs/news/events)
- 3 stat traffic: views hari ini, 7 hari (+ unique), 30 hari (+ unique)
- Chart 30-hari (SVG inline, no library) dengan dua garis: views (solid) dan uniques (dashed)
- **Top news**: 5 berita dengan kunjungan terbanyak (rank list dengan link preview)
- **Top pages**: 10 URL publik teratas (semua path, bukan cuma berita)

Query SQL pakai `count(DISTINCT visitor_hash)` agar unique visitors akurat untuk window apa pun. Index `(path, created_at)` dan `(visitor_hash, created_at)` di tabel sudah dipasang sehingga query tetap cepat saat tabel jutaan row.

## Public news pages

### `/berita` — archive

Daftar berita publik dengan tema yang sama seperti landing page (FloatingNavbar di atas, Footer di bawah, organic mask, accent rose, navy primary).

Fitur:

- **Hero header** dengan breadcrumb dan search input
- **Category chips** auto-populate dari nilai distinct di DB
- **Featured card** untuk berita teratas pada halaman 1 (organic mask, ukuran besar, accent ribbon)
- **Grid 3 kolom** memakai `NewsCard.svelte` yang sama dengan homepage (konsistensi visual)
- **Pagination** 9 item per halaman
- **Empty state** ramah saat filter tidak match
- **Reveal-on-scroll** animation (sama action `reveal` yang dipakai di landing)

Query string yang didukung: `?page=2`, `?kategori=Prestasi`, `?q=tim`. Filter bisa dikombinasikan.

### `/berita/[slug]` — detail

Layout artikel dengan typography setara berita media nasional:

- Breadcrumb di paling atas
- Category pill rose + tanggal
- Judul raksasa (`clamp(2rem, 5vw, 3.5rem)`) dengan letter-spacing rapat
- Lede paragraph
- Cover image dengan **organic mask** (sama dengan landing)
- **Share rail kiri** (sticky di desktop, horizontal di mobile): WhatsApp, Twitter/X, Facebook, copy-link
- Body content rendered dari HTML editor (sanitized) dengan styling konsisten dengan editor
- **Related posts** (3 berita: kategori sama dulu, lalu fallback ke berita terbaru)

OG meta tags lengkap (`og:title`, `og:description`, `og:image`, `og:type`, `twitter:card`) untuk preview link di social media.

## Editor stay-on-page

Setelah klik **Save changes** di `/admin/news/:id`:

- Halaman **tidak redirect** ke daftar
- Server return JSON state success (`{ ok: true, savedAt, item }`)
- Editor refresh internal state via `{#key item.id + item.updatedAt}` untuk re-mount
- **Toast "Tersimpan"** muncul di pojok kanan-bawah (auto-dismiss 2.8 detik)
- Local storage draft di-clear

Untuk **create** (`/admin/news/new`), server tetap redirect ke `/admin/news/:id?created=1` setelah simpan, supaya:
1. URL bisa di-bookmark
2. Editor punya konteks `id` untuk save berikutnya
3. Banner "Berita baru dipublikasikan" muncul di tujuan

Hasil: bekerja seperti WordPress / Notion — tetap di halaman editor setelah save, free untuk lanjut edit.

## Reader-friendly news features

Halaman detail (`/berita/[slug]`) sekarang punya:

### 1. Reading time + word count

Di bawah lede, ada strip metadata:

> 🕐 **5** menit baca · 📝 1.247 kata · 👁 234 dibaca

- Reading time: berdasarkan ~200 kata/menit (kecepatan baca rata-rata Bahasa Indonesia), dibulatkan ke atas, minimal 1 menit
- Word count: dihitung server-side dari plain text (HTML tags di-strip)
- View count: lifetime visit dari tabel `page_views` (privacy-friendly hash, tidak ada IP raw)

### 2. Reading progress bar

Top-of-page bar yang mengikuti scroll progress di area konten artikel. Gradient `primary → accent` dengan glow halus. Tetap fixed di top, sticky di atas FloatingNavbar (z-index 60).

### 3. Table of Contents (TOC) sidebar

Sticky di sebelah kanan konten (desktop ≥ 1200px) dengan:

- Auto-extract dari `<h2>`, `<h3>`, `<h4>` di body content
- Indent level 3 dan level 4 untuk hierarki visual
- **Active state** scroll-spy: section yang sedang dibaca highlight rose accent
- Smooth scroll dengan offset 92px (biar landing tepat di bawah navbar)
- URL hash auto-update saat klik (deep link friendly)
- Border kiri abu-abu yang berubah accent rose untuk item active
- Hanya muncul kalau artikel punya **2+ headings** (kalau cuma 1 atau 0, sembunyi otomatis — tidak masuk akal show TOC)

Heading ID dibuat server-side dengan slugify ASCII (max 80 char) + dedupe counter (`-2`, `-3`, dst). Aman untuk URL fragment.

### 4. Image lightbox

Klik gambar mana pun di body artikel → buka full-screen overlay dengan:

- Backdrop dark transparan + blur
- Image fit contain (preserve aspect ratio)
- Tombol close di pojok
- Tutup dengan: klik backdrop, tombol ✕, atau tekan **Escape**
- Cursor `zoom-in` di image (affordance), `zoom-out` di backdrop

### 5. Anchor scroll behavior

Headings dapat `scroll-margin-top: 6.5rem` agar saat user mengakses link `#section-id` (dari TOC, share, atau external), heading tidak ketutupan FloatingNavbar di atas.

### Server-side processing pipeline

Konten body diolah **sekali** server-side via `processContent()` di `src/lib/server/markdown.ts`:

1. Sanitize whitelist tag/atribut/scheme (defense in depth)
2. Inject `id` ke setiap h2/h3/h4 (regex pass)
3. Build TOC tree
4. Hitung word count + reading time

Hasilnya di-cache via SvelteKit's `+page.server.ts` — dijalankan saat halaman di-request, tidak ada parsing client-side, tidak butuh JS untuk render TOC tampil. JS hanya untuk scroll-spy active state, smooth scroll, lightbox, dan progress bar.