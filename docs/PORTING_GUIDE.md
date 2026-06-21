# Porting Guide — Menduplikasi Konsep NodeAdmin ke Bahasa/Framework Lain

Dokumen ini memandu pembuatan **bootstrap setara** di framework lain dengan **konsep yang sama**, memakai **idiom native** masing-masing (bukan menerjemahkan kode mentah).

> Prinsip kunci: yang diduplikasi adalah **konsep, prinsip, dan alur** — bukan kode TypeScript. Setiap framework punya cara idiomatik sendiri untuk mencapai tujuan yang sama.

---

## Nama App Baku

Hasil porting memakai konvensi nama `{Framework}Admin` (folder project, nama app, judul default):

| Framework | Nama | Framework | Nama |
|-----------|------|-----------|------|
| Node/Express (ini) | **NodeAdmin** | Django | **DjangoAdmin** |
| Laravel | **LaravelAdmin** | .NET Core | **DotNetAdmin** |
| NestJS | **NestAdmin** | Rust (Rocket) | **RustAdmin** |
| Spring Boot | **SpringAdmin** | Go (Gin) | **GoAdmin** |

Pakai nama ini untuk: folder project, `APP_NAME` di env, judul halaman, dan referensi di README/docs hasil porting.

---

## Bagian 1 — Konsep Inti (BAHASA-AGNOSTIK)

Berlaku untuk SEMUA target. Ini "kontrak" yang harus dipenuhi versi mana pun.

### Prinsip wajib
- **SOLID** — terutama Dependency Inversion: komponen bergantung pada abstraksi (interface/contract), di-inject, bukan di-`new` langsung.
- **DRY** — helper terpusat (pagination, search case-insensitive, render, dll).
- **Separation of Concerns** — Controller (HTTP) ≠ Service (bisnis) ≠ Repository/Model (data) ≠ View (presentasi).
- **Clean Code** — error lewat exception terpusat (bukan return error), penamaan jelas.
- **High Cohesion / Low Coupling** — modular per fitur, antar-modul lewat abstraksi.
- **Twelve-Factor** — config via env tervalidasi, stateless (session/cache eksternal), logs ke stdout, graceful shutdown.
- **TDD/BDD** — test wajib tiap fitur (unit/integration/api + skenario perilaku).
- **YAGNI** — bangun sesuai kebutuhan; API opsional kecuali diminta.

### Alur request (lifecycle) yang harus ada
```
Route → middleware (auth → RBAC → validasi) → Controller (tipis) → Service (logika, throw error) → Repository/Model → DB
                                                                                   ↘ error → handler terpusat
```

### Struktur modular per fitur
Tiap fitur = satu modul mandiri berisi lapisannya sendiri (model, migration, service+interface, validator, controller, route, view, test). Modul dimuat/terdaftar secara konsisten.

### Artefak per modul (matriks kebutuhan)
**Selalu**: Service+Interface, Controller, Route, **Test**, update dokumentasi.
**Kondisional**: Entity/Migration (jika simpan data), Validation (jika ada input tulis), View (jika ada UI), API (opsional — tawarkan).
**Aturan**: entity→migration wajib; input tulis→validator wajib; ada UI→route web wajib; ada API→test API + doc wajib; **test wajib untuk fitur apa pun**.

### Guardrail (jaga konsistensi saat dikembangkan AI)
1. **Dokumen aturan** (AGENTS.md setara) — sumber kebenaran pola & prinsip.
2. **Convention checker** — script/command yang gagal (exit≠0) bila modul menyimpang (service tanpa interface, controller `new` service, error tak lewat handler, dll) + cek kelengkapan kontekstual. Dijalankan di CI sebagai gate.
3. **Aturan AI**: sebelum coding, sajikan rencana artefak + tanya bila ambigu; setelah coding, jalankan checker+typecheck+test sampai hijau.

### Fitur fungsional referensi
RBAC (role+permission per-route), auth sesi (web) + token (API), reset password OTP, **theme switcher** (DB-driven, ganti palet tanpa rebuild), **frontend template switcher** (katalog landing dari sumber eksternal — paginasi + search server-side, thumbnail/preview ringan, unduh on-demand + cache), **landing publik bind-ke-Setting** (sample data-driven), multi-database (dialect-agnostic via ORM), file storage eksternal, multi-timezone.

### Capability Checklist (WAJIB direplikasi agar app porting IDENTIK)

Daftar lengkap kapabilitas NodeAdmin. App hasil porting **harus** punya padanannya (idiom native). Centang semua sebelum dianggap selesai.

#### 🔒 Keamanan
- [ ] **Security headers** (helmet setara) — HSTS, X-Frame-Options, X-Content-Type-Options, dll.
- [ ] **CSRF protection** untuk semua form web mutasi (token sinkron); API stateless (JWT) dikecualikan. Catatan: form multipart butuh token via query/header (body diparse belakangan).
- [ ] **Rate limiting** pada endpoint sensitif (login, register, reset OTP) — per-IP.
- [ ] **Auth ganda**: sesi (web, store di Redis/cache) + **JWT** (API), algoritma di-pin (HS256), blacklist token saat logout (TTL = sisa masa berlaku).
- [ ] **RBAC**: role + permission per-route; urutan middleware **authenticated → authorize** (auth dulu, baru cek izin); Administrator bypass.
- [ ] **Password**: hash bcrypt (rounds dari env); **reset OTP** = crypto-random + hashed + expiry + rate-limit (bukan plaintext/Math.random).
- [ ] **Validasi input** + anti **mass-assignment** (whitelist field; `stripUnknown` / DTO / FormRequest).
- [ ] **Upload aman**: validasi magic-byte (bukan hanya MIME klien), whitelist ekstensi, re-encode gambar bila bisa.
- [ ] **Cookie**: `httpOnly` + `sameSite` + `secure` (otomatis di production).
- [ ] **Secret fail-fast**: app berhenti bila SESSION/JWT secret kosong di production (jangan fallback ke nilai default).
- [ ] **Error tak bocor**: pesan generik ke user di production; detail hanya di log.
- [ ] **CORS** origin tepat (tanpa trailing slash), credentials sesuai kebutuhan.

#### ⚡ Kecepatan / Performa
- [ ] **Kompresi** response (gzip/brotli).
- [ ] **Static asset cache header** (mis. `maxAge` di production) + posisi middleware static paling awal.
- [ ] **Cache data yang dibaca tiap request** (mis. Setting global) dengan TTL + invalidasi saat update — hindari query berulang.
- [ ] **Connection pool** DB dikonfigurasi.
- [ ] **Pagination** di semua list (skip/take + meta) — hindari ambil seluruh tabel.
- [ ] **Hindari N+1**: eager/join yang tepat; batch query (mis. `In()`), bukan query dalam loop.
- [ ] **Tanpa cache-buster gambar tiap render** (biar browser cache bekerja).
- [ ] **Index DB** pada kolom yang sering difilter/cari.

#### 🧱 Arsitektur & Kualitas
- [ ] **Modular per fitur** + auto-load/registrasi modul.
- [ ] **DI container** + service implement interface (Dependency Inversion).
- [ ] **Error handling terpusat** (exception → handler), service `throw` (bukan return error).
- [ ] **Config env terpusat & tervalidasi** (tipe dikonversi, secret divalidasi).
- [ ] **Helper DRY**: pagination, search case-insensitive (`ciLike` setara), render/response, dll.
- [ ] **Graceful shutdown** (tutup koneksi DB/Redis saat SIGTERM/SIGINT).
- [ ] **Stateless** (session & file di store eksternal) → siap horizontal scaling.
- [ ] **Named routes** — URL dirujuk lewat nama (helper `route('nama')`), bukan string hardcode → mudah refactor.
- [ ] **Method-override** — form HTML bisa kirim PUT/DELETE (via `_method` atau mekanisme native framework).
- [ ] **Flash messages** — feedback sukses/error setelah redirect (PRG pattern), + tampilan `old input` saat validasi gagal.

#### 🗄️ Database (portabel — bukan cuma ORM)
- [ ] **Multi-database** via env (lihat "Kriteria ORM & Migration" di bawah).
- [ ] **Migration kode portabel** (bukan SQL vendor).
- [ ] **Tipe kolom abstrak**, tanpa collation hardcoded, tanpa raw query vendor, tanpa `LIKE` manual (case-sensitivity beda) → pakai helper case-insensitive.

#### 🎨 Fitur Fungsional
- [ ] **Theme switcher (admin)** — palet tema disimpan di DB, ganti tanpa rebuild (CSS variable), beberapa pilihan warna.
- [ ] **Frontend template switcher (landing)** — katalog desain landing dari sumber eksternal (mis. repo opentailwind). WAJIB:
  - **Daftar di server, sekali**: ambil katalog dari sumber (API/manifest) → cache (memori TTL + persist disk/cache store); **fallback** ke katalog kurasi statis bila sumber offline. Jangan fetch tiap request.
  - **Paginasi + search server-side** atas katalog (filter nama + kategori), bukan kirim seluruh daftar ke klien; **item aktif disematkan ke halaman pertama**.
  - **Thumbnail ringan + preview penuh**: render desain via iframe (thumbnail = iframe ter-scale, lazy-load saat terlihat; klik → modal preview); HTML preview **di-cache di sisi klien** (localStorage/setara) → server hanya proxy sekali per item.
  - **Anti-SSRF**: hanya item yang ada di katalog (atau cocok pola slug ketat) yang boleh di-fetch/proxy; validasi sebelum unduh.
  - **Unduh on-demand + cache lokal** saat item dipilih & disimpan (template aktif disajikan dari cache; app tetap ramping — hanya 1 default ter-bundle agar jalan offline).
- [ ] **Landing publik data-driven (sample)** — template default mengikat data Setting (nama, logo, deskripsi, kontak, copyright) dengan guard + fallback → contoh hidup pola binding; item katalog lain disajikan sebagai HTML statis (preview desain).
- [ ] **Multi-timezone** — tampilan tanggal mengikuti timezone user.
- [ ] **File storage eksternal** (S3/OSS/setara) dengan signed URL.
- [ ] **Email** (reset OTP, notifikasi) via SMTP konfigurable.
- [ ] **UI server-side** (template engine native + Tailwind): layout/partial (head/sidebar/topbar/foot), tabel + search + pagination, form CRUD, status pakai ikon, fallback gambar gagal-load.
- [ ] **Sidebar dinamis** — item menu tampil sesuai permission user (`hasAccess`), penanda menu aktif.
- [ ] **Halaman showcase komponen UI** (`/admin/v1/components` setara) — acuan hidup elemen: stat card+counter, chart (themeable), badge/status, alert, button+dropdown, form, tabel+pagination.
- [ ] Modul inti: **User, Role, Permission (RBAC), Profile, Setting, Dashboard (stats), Components (showcase), Landing (frontend template + halaman publik)**.

#### 🧪 Testing (wajib tiap fitur)
- [ ] **Unit** (helper murni), **Integration** (service↔DB, SQLite in-memory), **API** (HTTP), **Security** (RBAC/CSRF/rate-limit/JWT/mass-assign), **Smoke**, **E2E** (browser), **BDD** (skenario).
- [ ] **CI**: lint/checker + test + audit + matrix DB (MySQL/Postgres) tiap push/PR. (E2E dijalankan lokal — lambat/rapuh di CI, non-blocking → tak bernilai sebagai gate.)

#### 🛡️ Guardrail (jaga konsistensi pengembangan AI)
- [ ] **Dokumen aturan** (AGENTS.md setara) + mirror untuk tiap AI tool.
- [ ] **Convention checker** (gate CI) — menolak penyimpangan pola/prinsip + cek kelengkapan kontekstual (entity→migration, input→validator, ada→test, dll).
- [ ] **Generator modul** (`/make-module` setara) + **MODULE_GUIDE** template.
- [ ] **Aturan AI**: sajikan rencana artefak + tanya bila ambigu sebelum coding; verifikasi (checker+typecheck+test) sampai hijau.

#### 📚 Dokumentasi
- [ ] README (fitur, instalasi, env, multi-DB, testing, deployment), ARCHITECTURE, MODULE_GUIDE, TESTING, API (daftar endpoint), **UI_COMPONENTS (katalog snippet komponen)**.
- [ ] `.gitignore` mengecualikan artefak generated (log, coverage, build).

---

### Kriteria ORM & Migration (WAJIB dipenuhi versi target)
NodeAdmin memakai TypeORM karena **multi-database** + **migration fleksibel**. Versi framework lain HARUS memilih ORM yang memenuhi:

1. **Multi-database (dialect-agnostic)** — ganti DB cukup lewat config/env (`DB_TYPE` setara), tanpa ubah kode model. Minimal dukung MySQL/MariaDB + PostgreSQL + SQLite (SQLite penting untuk test in-memory yang cepat).
2. **Migration berbasis kode & portabel** — pakai API migration ORM (buat/ubah tabel lewat objek/builder), **bukan** SQL mentah spesifik-vendor. Mendukung up/down (reversible) + versioning.
3. **Tipe kolom portabel** — gunakan tipe abstrak ORM (`string`/`text`/`integer`/`boolean`/`timestamp`) yang dipetakan otomatis per dialek. **Hindari tipe vendor** (mis. `longtext`/`datetime` MySQL) — ini pelajaran nyata dari NodeAdmin: TypeORM multi-DB hanya berfungsi bila kode dijaga portabel. Checker target sebaiknya menolak tipe vendor (seperti `packages/cli/lib/checkConventions.js` di sini).
4. **Test pakai SQLite in-memory** — karena ORM agnostik, suite test jalan di SQLite cepat tanpa server DB; CI bisa jalankan matrix MySQL+Postgres untuk uji kompatibilitas.

**Dukungan multi-DB per ORM (cek saat memilih):**
| ORM | Multi-DB | Migration | Catatan |
|-----|----------|-----------|---------|
| Eloquent (Laravel) | ✅ MySQL/PG/SQLite/SQLServer | ✅ schema builder portabel | Sangat baik, bawaan |
| TypeORM/Prisma (NestJS) | ✅ | ✅ | TypeORM = sama spt NodeAdmin; Prisma agak beda gaya migration |
| Spring Data JPA/Hibernate | ✅ banyak dialek | ✅ via Flyway/Liquibase | JPA agnostik; migration pakai tool terpisah |
| Django ORM | ✅ MySQL/PG/SQLite/Oracle | ✅ migrations portabel | Sangat baik, bawaan |
| EF Core (.NET) | ✅ banyak provider | ✅ migrations portabel | Sangat baik; provider per-DB |
| Diesel (Rust) | ⚠️ **satu DB per-build** (feature flag), kurang fleksibel ganti runtime | ✅ migration (sering SQL) | **SeaORM lebih agnostik** → pilih SeaORM bila butuh multi-DB runtime |
| GORM (Go) | ✅ MySQL/PG/SQLite/SQLServer (driver per-dialek) | ⚠️ AutoMigrate (non-reversible) atau **golang-migrate** untuk versioned up/down | Pilih **golang-migrate** (SQL portabel) atau **goose** untuk migration reversible; AutoMigrate cukup utk dev/test |

> Jika ORM target kurang fleksibel (mis. Diesel), pilih alternatif yang agnostik (SeaORM) ATAU dokumentasikan keterbatasan + sediakan abstraksi repository agar ganti DB tetap terlokalisir.

---

## Bagian 2 — Prompt Template Universal

> **Prompt siap-copy per framework** (Laravel/NestJS/Spring/Django/.NET/Rust) ada di **[`docs/examples/PORT_PROMPTS.md`](examples/PORT_PROMPTS.md)** — tinggal salin & ganti path.

Ganti `{FRAMEWORK}` & `{PATH}`. Berikan AI akses ke folder NodeAdmin (referensi) + folder target (kosong, sudah di-scaffold framework-nya).

```
Saya punya bootstrap admin panel di {PATH_NODEADMIN} (Node.js/Express/TypeScript/TypeORM).
Baca file ini untuk memahami KONSEP, PRINSIP, ALUR (jangan tiru kode mentah):
  - docs/PORTING_GUIDE.md  (terutama Bagian 1 = konsep agnostik, dan tabel {FRAMEWORK} di Bagian 3)
  - AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md, docs/TESTING.md

Buatkan bootstrap SETARA di {FRAMEWORK} dengan KONSEP SAMA, memakai IDIOM NATIVE {FRAMEWORK}
(lihat tabel pemetaan). Pertahankan SEMUA prinsip di Bagian 1: SOLID/DI, DRY, SoC, Clean Code,
error terpusat, RBAC, env tervalidasi, theme switcher, test wajib tiap fitur, guardrail.
WAJIB penuhi SELURUH **Capability Checklist** Bagian 1 (keamanan + performa + arsitektur +
multi-DB + fitur + testing + guardrail) agar hasil porting IDENTIK kapabilitasnya dengan NodeAdmin.

WAJIB hasilkan juga:
  - AGENTS.md versi {FRAMEWORK} (aturan + checklist modul + larangan)
  - Convention checker idiomatik {FRAMEWORK} + integrasi CI
  - Equivalent "/make-module" (generator/command) bila framework mendukung
  - 1 modul percontohan lengkap (mis. User/Role/Permission) sebagai acuan pola
  - Halaman showcase komponen UI + docs/UI_COMPONENTS.md (katalog snippet)

Kerjakan BERTAHAP (rencanakan fase dulu, jangan one-shot): 
  fondasi → 1 modul percontohan → guardrails → sisanya. Verifikasi tiap fase (build+test hijau).
```

**Aturan emas:** minta *"konsep sama, idiom native"* — JANGAN *"terjemahkan kode TS"* (hasilnya janggal).

---

## Bagian 3 — Tabel Pemetaan Idiom per Framework

Kolom kiri = konsep NodeAdmin. Kolom kanan = padanan idiomatik. Yang ditandai **(bawaan)** sudah disediakan framework → tak perlu dibangun manual.

### 3.1 Laravel (PHP)
| Konsep NodeAdmin | Padanan Laravel |
|---|---|
| Modular per fitur | `nwidart/laravel-modules` atau folder `app/Domain/{Modul}` |
| DI (tsyringe) | **Service Container (bawaan)** + bind Contract→Impl di `ServiceProvider` |
| Service + Interface | Service class + Contract (interface) |
| Controller tipis + handler() | Resource Controller (logika di service) |
| Validator Joi stripUnknown | **FormRequest** → `$request->validated()` (bawaan) |
| Error AppError + middleware | Exception custom + `App\Exceptions\Handler` (bawaan) |
| RBAC | middleware + `spatie/laravel-permission` |
| Migration portabel | **Migration Laravel (bawaan, DB-agnostik)** |
| Entity/Repository (TypeORM) | **Eloquent Model** (+ Repository opsional) |
| View EJS+Tailwind+switcher | **Blade** + Tailwind + theme switcher (kolom DB) |
| env tervalidasi | `config/*.php` + `.env` + validasi via `config()` / package |
| Test Jest/supertest | **PHPUnit / Pest** + Feature test (bawaan) |
| BDD Cucumber | **Behat** |
| Convention checker | Artisan command custom + **Pint** + **PHPStan/Larastan** |
| /make-module skill | `php artisan make:module` (custom generator / stub) |
| Redis session | **driver session Redis (bawaan)** |

### 3.2 NestJS (TypeScript) — paling mirip, transisi termulus
| Konsep NodeAdmin | Padanan NestJS |
|---|---|
| Modular per fitur | **`@Module` (bawaan, native)** |
| DI (tsyringe) | **DI NestJS (bawaan)** + provider token untuk interface |
| Service + Interface | `@Injectable()` Service + interface + custom provider |
| Controller + handler() | `@Controller` + decorator route (bawaan) |
| Validator Joi | **`class-validator` + ValidationPipe (whitelist:true)** |
| Error terpusat | **Exception filter + HttpException (bawaan)** |
| RBAC | Guards + custom `@Roles()` decorator |
| ORM | TypeORM/Prisma (sama/serupa) |
| View EJS | Blade-less: tetap EJS/Handlebars, atau pisah SPA |
| env | **`@nestjs/config` + Joi schema (bawaan)** |
| Test | **Jest + supertest (bawaan Nest)** |
| BDD | jest-cucumber / Cucumber |
| Checker | ESLint rule custom + script |
| /make-module | **Nest CLI `nest g` schematics (bawaan)** + custom schematic |

### 3.3 Spring Boot (Java)
| Konsep NodeAdmin | Padanan Spring Boot |
|---|---|
| Modular per fitur | package per fitur / Maven module |
| DI (tsyringe) | **`@Component`/`@Service` + `@Autowired` (bawaan)** |
| Service + Interface | interface + `@Service` impl (bawaan, idiomatik) |
| Controller + handler() | `@RestController` / `@Controller` |
| Validator | **Bean Validation `@Valid` + DTO (bawaan)** |
| Error terpusat | **`@ControllerAdvice` + `@ExceptionHandler` (bawaan)** |
| RBAC | **Spring Security** + `@PreAuthorize` |
| ORM | **Spring Data JPA / Hibernate** |
| View | Thymeleaf + Tailwind (atau REST + SPA) |
| env | **`application.yml` + `@ConfigurationProperties` (bawaan)** |
| Test | **JUnit 5 + MockMvc + Testcontainers** |
| BDD | **Cucumber-JVM** |
| Checker | ArchUnit (uji arsitektur!) + Checkstyle/SpotBugs |
| /make-module | Maven archetype / generator custom |

### 3.4 Django (Python)
| Konsep NodeAdmin | Padanan Django |
|---|---|
| Modular per fitur | **Django "app" per fitur (bawaan)** |
| DI (tsyringe) | umumnya tanpa container; service module + inject via argumen/`django-injector` |
| Service + Interface | Service class + `abc.ABC` (Protocol/ABC) |
| Controller | **DRF ViewSet / APIView** (atau views) |
| Validator | **DRF Serializer (bawaan)** |
| Error terpusat | **DRF exception handler custom (bawaan)** |
| RBAC | **Permissions DRF + Groups (bawaan)** / `django-guardian` |
| ORM/Migration | **Django ORM + migrations (bawaan)** |
| View | Django Templates + Tailwind |
| env | `django-environ` + settings |
| Test | **pytest-django / unittest + DRF APITestCase** |
| BDD | **behave** / pytest-bdd |
| Checker | custom mgmt command + ruff + mypy |
| /make-module | **`manage.py startapp` (bawaan)** + template custom |

### 3.5 .NET Core (C# / ASP.NET Core)
| Konsep NodeAdmin | Padanan ASP.NET Core |
|---|---|
| Modular per fitur | folder/Feature (Vertical Slice) atau Class Library per modul |
| DI (tsyringe) | **DI bawaan `IServiceCollection` (`AddScoped` dll)** |
| Service + Interface | `interface IXService` + impl, register di `Program.cs` |
| Controller + handler() | **`[ApiController]` Controller (bawaan)** / Minimal API |
| Validator | **FluentValidation** atau DataAnnotations + ModelState |
| Error terpusat | **Exception middleware / `IExceptionHandler` (bawaan .NET 8)** |
| RBAC | **ASP.NET Identity + Authorization Policy/`[Authorize(Roles)]`** |
| ORM/Migration | **Entity Framework Core + Migrations (bawaan, DB-agnostik)** |
| View | Razor Pages/Views + Tailwind (atau API + SPA) |
| env | **`appsettings.json` + Options pattern `IOptions<T>` (bawaan)** |
| Test | **xUnit + WebApplicationFactory (integration) + Testcontainers** |
| BDD | **SpecFlow / Reqnroll** |
| Checker | Roslyn Analyzer custom + EditorConfig + analyzers |
| /make-module | `dotnet new` template custom |

### 3.6 Rust (Rocket)
| Konsep NodeAdmin | Padanan Rust + Rocket |
|---|---|
| Modular per fitur | module (`mod`) per fitur / crate workspace |
| DI (tsyringe) | tanpa container besar — trait object + Rocket **managed state** (`State<T>`), atau `shaku` |
| Service + Interface | **trait** (interface) + struct impl |
| Controller + handler() | Rocket route handler (`#[get]/#[post]` + guards) |
| Validator | struct + `validator` crate + `FromForm`/`Json<T>` guard |
| Error terpusat | `enum AppError` + impl `Responder` (mapping ke HTTP) |
| RBAC | Rocket **Request Guard** custom (cek role/permission) |
| ORM/Migration | **Diesel** atau **SeaORM** + migrations |
| View | Rocket templates (Tera/Handlebars) + Tailwind |
| env | `figment` (bawaan Rocket) / `dotenvy` + struct config |
| Test | **`#[test]` + `rocket::local` client (integration)** |
| BDD | **`cucumber` crate** |
| Checker | `clippy` lint custom + script CI |
| /make-module | `cargo generate` template / script |

### 3.7 Go (Gin)
> **Kenapa Gin (bukan Fiber)**: Gin di atas `net/http` standar → semua lib ekosistem Go (OSS SDK, OAuth, observability, middleware) langsung kompatibel. Fiber pakai `fasthttp` (non-standar) → sering perlu adapter/tak didukung. Untuk admin panel (bottleneck = DB/IO, bukan HTTP parsing) keunggulan throughput Fiber tak relevan, sedangkan gap kompatibilitas fasthttp = utang teknis. **Gin = kapabilitas setara, risiko ekosistem paling kecil.**

| Konsep NodeAdmin | Padanan Go + Gin |
|---|---|
| Modular per fitur | package per fitur (`internal/modules/{modul}`) + registrasi router eksplisit |
| DI (tsyringe) | **constructor injection manual** (wiring di `main.go`/`wire`) atau **`google/wire`** (compile-time DI) |
| Service + Interface | **interface** + struct impl (idiom Go: interface di sisi konsumen) |
| Controller tipis + handler() | Gin `HandlerFunc` (`*gin.Context`), logika di service |
| Validator Joi stripUnknown | **`go-playground/validator`** + binding struct tag (`binding:"required"`) + DTO whitelist (anti mass-assign) |
| Error AppError + middleware | `AppError` struct + **middleware error terpusat** (`c.Error()` + handler), service `return error` di-map ke HTTP |
| RBAC | middleware auth → middleware authorize (cek role/permission), atau **Casbin** (`casbin/gin`) |
| Migration portabel | **golang-migrate** / **goose** (SQL portabel up/down) — bukan AutoMigrate utk produksi |
| Entity/Repository (TypeORM) | **GORM model** + repository interface (multi-DB via driver) |
| View EJS+Tailwind+switcher | **`html/template`** (atau `templ`) + Tailwind + theme switcher (kolom DB, CSS var) |
| env tervalidasi | **`spf13/viper`** + struct config + validasi fail-fast (secret kosong di prod → panic) |
| Session Redis | **`gin-contrib/sessions`** + redis store |
| JWT (API) | **`golang-jwt/jwt`** (HS256 di-pin) + blacklist token via Redis (TTL = sisa berlaku) |
| Password/OTP | **`golang.org/x/crypto/bcrypt`** + OTP `crypto/rand` (hashed + expiry + rate-limit) |
| Rate limit | middleware per-IP (`ulule/limiter` / `gin-contrib`) |
| Security headers | **`secure`** middleware (helmet setara) + `gin-contrib/cors` |
| Kompresi/static cache | **`gin-contrib/gzip`** + `Cache-Control` pada static |
| File storage (OSS) | **`aliyun-oss-go-sdk`** (resmi) / `aws-sdk-go-v2` (S3) + signed URL |
| Email | **`net/smtp`** / `gomail` |
| Graceful shutdown | `http.Server.Shutdown(ctx)` pada SIGTERM/SIGINT (bawaan `net/http`) |
| env/Test | **`testing` + `httptest`** (integration) + **SQLite in-memory** (`glebarez/sqlite`, pure-Go) |
| BDD | **`cucumber/godog`** |
| Convention checker | **custom linter** (`go/ast` atau **golangci-lint** custom rule) + script gate CI |
| /make-module skill | **generator Go** (`text/template`) — `go run ./cmd/make-module` |

---

## Catatan Penting

1. **Banyak hal jadi lebih mudah** di framework matang (Laravel/Nest/Spring/.NET/Django): DI, validasi, migration, RBAC sudah bawaan. Effort yang kita keluarkan manual di NodeAdmin sebagian **tak perlu** diulang — pakai yang native.
2. **Yang tetap harus dibuat manual** di mana pun: AGENTS.md versi target, convention checker, equivalent /make-module, theme switcher, **frontend template switcher (katalog + paginasi/search server-side + thumbnail/preview cache-klien + unduh on-demand)**, **landing publik data-driven (bind ke Setting)**, struktur modular yang disepakati.
3. **Idiom > kemiripan**: kode harus terasa natural di bahasa target. Reviewer framework itu harus menganggapnya "ditulis oleh developer {FRAMEWORK}", bukan "porting dari JS".
4. **Bertahap & terverifikasi**: fondasi → modul percontohan → guardrail → sisanya; build+test hijau tiap fase.
5. **Test = non-negotiable**: apa pun bahasanya, tiap fitur wajib test (prinsip TDD/BDD dipertahankan).
