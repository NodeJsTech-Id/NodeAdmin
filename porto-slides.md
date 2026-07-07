# Script Slide Portofolio NodeAdmin — untuk Claude Design

> Cara pakai: copy seluruh isi blok "PROMPT" di bawah, tempel ke Claude design, dan minta hasilnya sebagai slide PowerPoint (.pptx) / presentasi. Naskah per slide sudah final — Claude design tinggal mengatur visualnya.

---

## PROMPT (copy mulai dari sini)

Buatkan slide presentasi PowerPoint portofolio proyek software untuk CV, total **10 slide**, rasio 16:9, bahasa Indonesia.

**Arahan desain:**
- Gaya: modern, bersih, profesional (tech portfolio) — bukan gaya korporat kaku.
- Warna utama: biru gelap (#1E3A5F) + aksen hijau Node.js (#3C873A), latar terang, banyak whitespace.
- Font sans-serif tegas untuk judul, ringan untuk isi. Maksimal 6 bullet per slide.
- Gunakan ikon sederhana per bullet bila memungkinkan; hindari clipart.
- Footer kecil di tiap slide: "NodeAdmin — Portofolio Mulyawan Sentosa".

**Isi slide (ikuti persis):**

### Slide 1 — Cover
- Judul besar: **NodeAdmin**
- Subjudul: Admin Panel Starter Pack — Node.js + TypeScript
- Baris bawah: Mulyawan Sentosa · Portofolio Proyek · github.com/NodeJsTech-Id/NodeAdmin

### Slide 2 — Ringkasan Proyek
Judul: "Apa itu NodeAdmin?"
- Starter pack open-source (MIT) untuk membangun admin panel Node.js — TypeScript + Express + TypeORM.
- Fondasi scalable: prinsip SOLID, Dependency Injection, Clean Code, Twelve-Factor.
- Monorepo: aplikasi referensi + 3 paket npm terpublikasi (`@flazhost-nodeadmin/core`, `cli`, `create-app`).
- Scaffold aplikasi lengkap dengan satu perintah: `npm create @flazhost-nodeadmin/app`.

### Slide 3 — Peran & Kontribusi
Judul: "Peran Saya"
- Solo developer end-to-end: arsitektur, implementasi, tooling, testing, CI/CD, dokumentasi.
- Merancang runtime generik dan mengekstraknya menjadi paket npm ber-versi (changesets).
- Membangun CLI tooling & scaffolder untuk developer experience.
- Menjadikannya aplikasi referensi yang di-port ke 10+ framework lain.

### Slide 4 — Fitur Utama (1/2)
Judul: "Fitur Utama"
- User Management + RBAC — CRUD user, multi-role, permission per-rute & per-aksi.
- Autentikasi ganda — session (Passport + Redis) untuk web, JWT untuk REST API.
- Password reset via OTP email — hashed, ber-expiry, rate-limited.
- Multi-database — MySQL, MariaDB, PostgreSQL, SQLite, SQL Server, Oracle (ganti 1 env var).

### Slide 5 — Fitur Utama (2/2)
Judul: "Fitur Unggulan"
- Template Switcher — 9 tema warna admin, ganti tanpa rebuild.
- Frontend Template Switcher — 640 desain landing page dengan pencarian, filter kategori, live thumbnail & preview.
- File storage adapter — Alibaba OSS / AWS S3 / MinIO / Cloudflare R2 / Backblaze B2, re-encode gambar via sharp.
- Stateless by design — session di Redis, file di object storage → siap horizontal scaling.

### Slide 6 — Arsitektur
Judul: "Arsitektur & Prinsip"
- Modular per fitur: `routes → middleware → controller → service → entity → views`.
- Dependency Injection (tsyringe): service mengimplementasikan interface, di-inject via container.
- Error handling terpusat: `AppError` + middleware; service throw, bukan return error.
- Config via env terpusat & tervalidasi; graceful shutdown; log ke stdout (Twelve-Factor).
- (Saran visual: diagram alur lapisan dari kiri ke kanan.)

### Slide 7 — Keamanan Berlapis
Judul: "Keamanan"
- Helmet security headers · CSRF token di semua form web.
- Rate limiting login/register/OTP per IP · session cookie httpOnly/sameSite/secure.
- bcrypt + JWT algorithm pinning (HS256) + blacklist token saat logout.
- RBAC middleware di setiap rute admin · mass-assignment guard (Joi stripUnknown).
- Validasi upload magic-byte · fail-fast bila secret kosong di production.

### Slide 8 — Testing & CI/CD
Judul: "Kualitas: 7 Lapis Pengujian"
- Unit · Integration (SQLite in-memory) · API (supertest) · Security · Smoke.
- E2E: Playwright, 3 browser engine, 65 test / 8 spec · BDD: Cucumber/Gherkin.
- CI GitHub Actions: typecheck + Jest + audit + matriks DB (MySQL/Postgres) + Playwright tiap push/PR.
- Convention checker kustom (`nodeadmin check`) sebagai CI gate — memaksa pola arsitektur otomatis.

### Slide 9 — Dampak & Highlight
Judul: "Dampak"
- Aplikasi referensi yang di-port ke 10+ framework/bahasa: Go, Rust, C++, PHP, Laravel, NestJS, Django, Spring, ASP.NET, Kotlin — dengan paritas fitur.
- Fleet 11 implementasi tersinkronisasi otomatis via pipeline GitHub Actions + verifikasi CI.
- Runtime generik sebagai paket npm → aplikasi turunan cukup `npm update`, tanpa copy-paste kode.
- (Saran visual: grid logo bahasa/framework.)

### Slide 10 — Tech Stack & Kontak
Judul: "Tech Stack"
- TypeScript · Express · TypeORM · Redis · EJS + Tailwind CSS · tsyringe · Passport · Joi.
- Jest · supertest · Playwright · Cucumber · GitHub Actions · changesets · pm2 · sharp.
- Object Storage: OSS / S3-compatible.
- Kontak: flazhost.com@gmail.com · github.com/NodeJsTech-Id/NodeAdmin
- (Saran visual: tampilkan stack sebagai badge/chip.)

## (akhir PROMPT)

---

## Catatan

- Kalau Claude design menanyakan format, minta **.pptx** (PowerPoint) langsung.
- Kalau hasil slide terlalu padat, minta "pecah slide 4–5 dan 7 menjadi lebih ringkas, maksimal 4 bullet".
- Screenshot aplikasi ada di `docs/screenshots/` (login, dashboard, users, roles, setting, components, landing) — bisa diunggah ke Claude design untuk memperkaya slide 4–6.
