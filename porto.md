# NodeAdmin — Admin Panel Starter Pack (Node.js + TypeScript)

> Portofolio proyek untuk CV — Mulyawan Sentosa

## Ringkasan

**NodeAdmin** adalah starter pack / bootstrap open-source (MIT) untuk membangun aplikasi admin panel berbasis Node.js — TypeScript + Express + TypeORM. Dirancang sebagai fondasi yang scalable dengan prinsip software engineering yang solid (SOLID, DI, Clean Code, Twelve-Factor), keamanan berlapis, dan test suite lengkap (unit → E2E → BDD).

Proyek ini berbentuk **monorepo** (npm workspaces): aplikasi referensi + tiga paket npm yang dipublikasikan (`@flazhost-nodeadmin/*`), sehingga aplikasi turunan cukup `npm update` untuk menarik pembaruan runtime tanpa menyalin kode.

- **Repo**: https://github.com/NodeJsTech-Id/NodeAdmin
- **npm**: [`@flazhost-nodeadmin/core`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) · [`@flazhost-nodeadmin/cli`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) · [`@flazhost-nodeadmin/create-app`](https://www.npmjs.com/package/@flazhost-nodeadmin/create-app)
- **Scaffold sekali perintah**: `npm create @flazhost-nodeadmin/app@latest myapp` (varian Full UI+API atau API-only)

## Peran & Kontribusi

Perancang dan pengembang tunggal (solo developer) — arsitektur, implementasi, tooling, testing, CI/CD, dokumentasi, hingga rilis paket ke npm.

## Fitur Utama

- **User Management + RBAC** — CRUD user, multi-role, role & permission berbasis rute + per-aksi.
- **Autentikasi ganda** — session (Passport local + Redis) untuk web, JWT (HS256, blacklist saat logout) untuk REST API.
- **Password reset via OTP email** — OTP di-hash, ber-expiry, dan di-rate-limit.
- **Template Switcher** — 9 tema warna admin yang bisa diganti dari halaman Setting tanpa rebuild.
- **Frontend Template Switcher** — halaman publik dengan **640 desain landing page** (katalog opentailwind), dilengkapi pencarian, filter kategori, pagination server-side, live thumbnail, dan preview ber-cache di `localStorage`; template terpilih diunduh & di-cache lokal saat Save.
- **Multi-database** — dialect-agnostic via TypeORM: MySQL, MariaDB, PostgreSQL, SQLite, SQL Server, Oracle — cukup ganti `DB_TYPE`.
- **File storage adapter** — upload ke object storage (Alibaba Cloud OSS atau AWS S3 / S3-compatible: MinIO, Cloudflare R2, Backblaze B2) dengan re-encode gambar via sharp.
- **Stateless & siap horizontal scaling** — session di Redis, file di object storage.
- **Multi-timezone** — tampilan tanggal mengikuti timezone user (dayjs).

## Arsitektur & Prinsip

Struktur **modular per fitur** (`src/modules/<module>`) dengan lapisan `routes → middleware → controller → service → entity → views`.

| Prinsip | Implementasi |
|---------|--------------|
| SOLID / DI | tsyringe — controller & service di-inject via container, service mengimplementasikan interface (`I*Service`) |
| Separation of Concerns | Controller (HTTP) ≠ Service (bisnis) ≠ Repository (data) ≠ View (presentasi) |
| Clean Code | Error handling terpusat (`AppError` + middleware `errorHandler`); service `throw`, bukan `return error` |
| DRY | Helper terpusat: `paginate()`, `ciLike()`, `renderView()` |
| Twelve-Factor | Env terpusat & tervalidasi, stateless, log ke stdout, graceful shutdown |

## Keamanan Berlapis

Helmet (security headers) · CSRF synchronizer token di semua form web · rate limiting login/register/OTP per IP · session cookie `httpOnly`/`sameSite`/`secure` · bcrypt · JWT algorithm pinning · RBAC middleware di setiap rute admin · mass-assignment guard (Joi `stripUnknown`) · validasi upload magic-byte · fail-fast bila secret kosong di production.

## Testing & CI/CD

- **7 lapis pengujian**: unit, integration (SQLite in-memory), API (supertest), security (RBAC/CSRF/rate-limit/JWT/mass-assign), smoke, E2E (Playwright, 3 browser engine, 65 test / 8 spec), dan BDD (Cucumber/Gherkin).
- **CI GitHub Actions**: typecheck + Jest + audit + matriks database (MySQL/Postgres) + Playwright di setiap push/PR.
- **Convention checker kustom** (`nodeadmin check`) sebagai CI gate — memaksa pola arsitektur (DI, error handling, portabilitas entity) secara otomatis.
- **Rilis paket** dikelola via changesets (versioning + CHANGELOG + publish npm otomatis).

## Tooling & Developer Experience

- **Scaffolder** `create-app`: satu perintah menghasilkan aplikasi lengkap; interaktif memilih varian Full / API-only.
- **`npx nodeadmin add-ui`**: upgrade proyek API-only menjadi Full secara aditif & idempoten, lalu verifikasi otomatis (install → check → tsc → test).
- **CLI tooling**: `nodeadmin check`, `make-migration`, `copy-views`.

## Tech Stack

TypeScript · Express · TypeORM · MySQL/PostgreSQL/SQLite/MSSQL/Oracle · Redis · EJS + Tailwind CSS · tsyringe (DI) · Passport (local + JWT) · Joi · Jest + supertest · Playwright · Cucumber · sharp · Object Storage (OSS / S3-compatible) · Helmet · GitHub Actions · changesets · pm2.

## Dampak & Highlight

- Menjadi **aplikasi referensi** yang saya port ke 10+ framework/bahasa lain (Go/Gin, Rust/Rocket, C++/Drogon, PHP native, Laravel, NestJS, Django, Spring, ASP.NET, Kotlin) dengan paritas fitur — membuktikan desain arsitekturnya portabel lintas ekosistem.
- Seluruh fleet ter-hubung pipeline sinkronisasi otomatis (GitHub Actions → runner repo) dengan verifikasi CI.
- Runtime generik diekstrak menjadi paket npm ber-versi, sehingga banyak aplikasi turunan bisa menerima update tanpa copy-paste kode.
