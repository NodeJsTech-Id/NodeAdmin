# create-app — NodeAdmin

[![npm](https://img.shields.io/npm/v/@flazhost-nodeadmin/create-app.svg)](https://www.npmjs.com/package/@flazhost-nodeadmin/create-app)
[![license](https://img.shields.io/npm/l/@flazhost-nodeadmin/create-app.svg)](https://github.com/FlazHost-Com/NodeAdmin/blob/main/LICENSE)

Scaffold **aplikasi admin panel Node.js yang utuh & siap pakai** dalam satu perintah — auth, RBAC, profile, setting, template switcher, migrasi + seed admin, semuanya sudah tertata.

```bash
npm create @flazhost-nodeadmin/app myapp
```

Juga: `npm init`, `yarn create`, `pnpm create`. Tanpa argumen nama → ditanya interaktif.

---

## ⚡ Mulai cepat (zero-setup)

```bash
npm create @flazhost-nodeadmin/app myapp
cd myapp
npm install
cp .env.example .env          # default: SQLite — tanpa server DB
npm run migration:run         # buat tabel + seed admin & setting
npm run start:dev             # http://localhost:3000
```

Buka **http://localhost:3000** → login:

| Email | Password |
|-------|----------|
| `admin@admin.com` | `12345678` |

> ⚠️ Ganti password admin sebelum production.

---

## ✨ Yang kamu dapatkan

Aplikasi **TypeScript + Express + TypeORM** lengkap, bukan boilerplate kosong:

| Fitur | Detail |
|-------|--------|
| 🔐 **Authentication** | Sesi (Passport local + Redis) untuk web & **JWT** untuk API |
| 👥 **RBAC** | User, Role, Permission — kontrol akses per-route & per-aksi |
| 👤 **Profile** | Kelola profil & password sendiri, foto profil |
| 🔑 **Password Reset** | OTP via email (hashed + expiry) |
| 🎨 **Template Switcher** | 9 tema warna, ganti dari halaman Setting tanpa rebuild |
| 🗄️ **Multi-Database** | MySQL, MariaDB, PostgreSQL, SQLite, MSSQL, Oracle — cukup ganti `DB_TYPE` |
| 🌐 **Multi-Timezone** | Tampilan tanggal mengikuti timezone pengguna |
| 📦 **File Storage** | Upload ke Alibaba Cloud OSS (re-encode gambar via sharp) |
| 🔒 **Security** | Helmet, CSRF, rate-limit, bcrypt, mass-assignment guard, validasi upload |
| 🧪 **Testing** | Suite Jest (unit/integration/api/security) + Playwright + Cucumber |

Runtime generik ditarik dari paket npm [`@flazhost-nodeadmin/core`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) + [`@flazhost-nodeadmin/cli`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) — **update cukup `npm update`**, tanpa menyalin ulang kode.

---

## 🗄️ Ganti database

Default **SQLite** (tanpa server). Untuk DB lain, edit `.env`:

```env
DB_TYPE=mysql        # mysql | mariadb | postgres | better-sqlite3 | mssql | oracle
DB_HOST=localhost
DB_DATABASE=nodeadmin
```

Driver `mysql2` & `pg` sudah terpasang. Lalu `npm run migration:run`.

---

## 📋 Prasyarat

- **Node.js** ≥ 18
- **Redis** (session store) — atau jalankan tanpa untuk eksperimen cepat
- Database sesuai `DB_TYPE` (SQLite tak perlu server)

---

## 📂 Yang ter-scaffold

App standalone lengkap dengan `src/` (modul access/auth/profile/setting/dashboard), views EJS + Tailwind, migrasi, test, dan dokumentasi. Lihat `README.md` di dalam project hasil scaffold untuk panduan penuh (arsitektur, prinsip, API).

---

## 🔗 Tautan

- 📦 [Repository](https://github.com/FlazHost-Com/NodeAdmin)
- 🧩 [`@flazhost-nodeadmin/core`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) — runtime
- 🛠️ [`@flazhost-nodeadmin/cli`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) — tooling

## Lisensi

ISC
