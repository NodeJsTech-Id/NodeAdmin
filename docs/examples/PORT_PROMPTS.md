# Prompt Siap-Copy — Porting NodeAdmin ke Framework Lain

Kumpulan prompt **tinggal copy-paste** untuk menduplikasi konsep NodeAdmin ke framework lain.

## Nama app baku (`{Framework}Admin`)
Semua hasil porting WAJIB pakai nama standar berikut (folder project + nama app):

| Framework | Nama app |
|-----------|----------|
| Node/Express (referensi) | **NodeAdmin** |
| Laravel | **LaravelAdmin** |
| NestJS | **NestAdmin** |
| Spring Boot | **SpringAdmin** |
| Django | **DjangoAdmin** |
| .NET Core | **DotNetAdmin** |
| Rust (Rocket) | **RustAdmin** |
| Go (Gin) | **GoAdmin** |

## Cara pakai (3 langkah)
1. **Scaffold project target kosong** (perintah di tiap bagian).
2. **Buka AI (Claude Code/Cursor/dll)** dengan akses ke DUA folder: `NodeAdmin/` (referensi) + folder target.
3. **Copy prompt** framework yang dituju → tempel. Ganti `{PATH_NODEADMIN}` & `{PATH_TARGET}` dengan path absolutmu.

> Prinsip: AI membuat **konsep sama, idiom native** — bukan terjemahan kode. Kerjakan **bertahap** (fase), verifikasi tiap fase (build+test hijau). Detail pemetaan ada di `docs/PORTING_GUIDE.md`.

---

## 0. Blok umum (otomatis dirujuk tiap prompt)

Tiap prompt di bawah sudah memuat instruksi standar ini:
- **Nama app baku** `{Framework}Admin` (lihat tabel di atas) — dipakai untuk folder project, `APP_NAME` env, judul halaman, dan README/docs hasil porting.
- Baca `docs/PORTING_GUIDE.md` (Bagian 1 konsep + tabel framework terkait), `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/MODULE_GUIDE.md`, `docs/TESTING.md`.
- Pertahankan prinsip: SOLID/DI, DRY, SoC, Clean Code, error terpusat, RBAC, env tervalidasi, theme switcher (DB-driven), **frontend template switcher (landing) + landing publik data-driven**, test wajib tiap fitur, guardrail.
- **WAJIB penuhi SELURUH "Capability Checklist" di PORTING_GUIDE Bagian 1** (keamanan: helmet/CSRF/rate-limit/JWT+sesi/bcrypt/OTP-hash/mass-assign/upload-magicbyte/secret-fail-fast; performa: kompresi/cache-setting/static-cache/pool/pagination/anti-N+1; arsitektur; multi-DB; fitur; testing; guardrail). App porting harus IDENTIK kapabilitasnya dengan NodeAdmin.
- **ORM WAJIB multi-database (dialect-agnostic) + migration kode portabel + tipe kolom abstrak** (lihat "Kriteria ORM & Migration" di PORTING_GUIDE Bagian 1). Test pakai SQLite in-memory. Hindari tipe/SQL vendor.
- Hasilkan juga: AGENTS.md versi target + convention checker + CI + equivalent `/make-module` + 1 modul percontohan (User/Role/Permission) lengkap + **halaman showcase komponen UI (`/admin/v1/components` setara) + docs/UI_COMPONENTS.md**.
- **Modul Landing + Frontend Template Switcher** (lihat checklist "Fitur Fungsional" PORTING_GUIDE): katalog desain landing dari sumber eksternal — **daftar di server sekali (cache + fallback kurasi)**, **paginasi + search server-side** (item aktif ke halaman 1), **thumbnail iframe ter-scale (lazy) + modal preview** dgn **cache HTML di klien**, **anti-SSRF** (whitelist katalog/pola slug), **unduh on-demand + cache lokal** saat dipilih (1 default ter-bundle). **Landing default bind ke Setting** (nama/logo/deskripsi/kontak/copyright, guard+fallback) sebagai sample data-driven.
- BERTAHAP: fondasi → modul percontohan → guardrail → sisanya. Verifikasi tiap fase.

---

## 1. Laravel (PHP)

Scaffold:
```bash
composer create-project laravel/laravel LaravelAdmin   # nama baku: LaravelAdmin
```

Prompt:
```
Saya punya bootstrap admin panel di {PATH_NODEADMIN} (Node.js/Express/TypeScript/TypeORM).
Baca untuk memahami KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah):
docs/PORTING_GUIDE.md (Bagian 1 + tabel 3.1 Laravel), AGENTS.md, docs/ARCHITECTURE.md,
docs/MODULE_GUIDE.md, docs/TESTING.md.

Target: {PATH_TARGET} (Laravel 11 kosong).
Buat bootstrap SETARA dengan KONSEP SAMA pakai IDIOM NATIVE Laravel. Pemetaan:
- Modular per fitur   → nwidart/laravel-modules
- DI                  → Service Container + bind Contract→Impl di ServiceProvider
- Service + Interface → Service class + Contract
- Validasi            → FormRequest ($request->validated())
- Error terpusat      → Exception custom + App\Exceptions\Handler
- RBAC                → middleware + spatie/laravel-permission
- ORM/Migration       → Eloquent + migration Laravel
- View + theme switcher → Blade + Tailwind + kolom theme di DB
- Landing + FE template → Blade publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- Test                → Pest/PHPUnit Feature test + Behat (BDD)
- Convention checker  → artisan command + Pint + Larastan
- /make-module        → php artisan make:module

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE. WAJIB hasilkan AGENTS.md Laravel,
convention checker + CI, php artisan make:module, dan modul percontohan User/Role/Permission.
Kerjakan BERTAHAP, rencanakan fase dulu, verifikasi tiap fase (composer test + checker hijau).
```

---

## 2. NestJS (TypeScript) — transisi termulus

Scaffold:
```bash
npm i -g @nestjs/cli && nest new NestAdmin   # nama baku: NestAdmin
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.2 NestJS), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md untuk KONSEP/PRINSIP/ALUR.

Target: {PATH_TARGET} (NestJS kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE NestJS. Pemetaan:
- Modular per fitur   → @Module
- DI                  → DI NestJS + provider token untuk interface
- Service + Interface → @Injectable Service + interface + custom provider
- Controller          → @Controller + decorator route
- Validasi            → class-validator + ValidationPipe (whitelist:true)
- Error terpusat      → Exception filter + HttpException
- Landing + FE template → view publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- RBAC                → Guards + @Roles() decorator
- ORM                 → TypeORM (atau Prisma)
- env                 → @nestjs/config + Joi schema
- Test                → Jest + supertest + jest-cucumber (BDD)
- Checker             → ESLint rule custom + script
- /make-module        → Nest CLI schematic custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, schematic
generator, dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 3. Spring Boot (Java)

Scaffold: buat project di https://start.spring.io (artifact/nama baku: **SpringAdmin**; deps: Web, Data JPA, Security, Validation, driver DB).

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.3 Spring Boot), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md.

Target: {PATH_TARGET} (Spring Boot kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE Spring. Pemetaan:
- Modular per fitur   → package per fitur / Maven module
- DI                  → @Service/@Component + @Autowired
- Service + Interface → interface + @Service impl
- Controller          → @RestController / @Controller
- Validasi            → Bean Validation @Valid + DTO
- Error terpusat      → @ControllerAdvice + @ExceptionHandler
- RBAC                → Spring Security + @PreAuthorize
- ORM                 → Spring Data JPA / Hibernate
- View                → Thymeleaf + Tailwind (atau REST + SPA)
- Landing + FE template → view publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → application.yml + @ConfigurationProperties
- Test                → JUnit 5 + MockMvc + Testcontainers
- BDD                 → Cucumber-JVM
- Checker             → ArchUnit + Checkstyle/SpotBugs
- /make-module        → Maven archetype / generator custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker (ArchUnit) + CI,
generator modul, dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 4. Django (Python)

Scaffold:
```bash
mkdir DjangoAdmin && cd DjangoAdmin   # folder baku: DjangoAdmin
pip install django djangorestframework && django-admin startproject config .
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.4 Django), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md.

Target: {PATH_TARGET} (Django kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE Django. Pemetaan:
- Modular per fitur   → Django "app" per fitur
- Service + Interface → Service class + abc.ABC/Protocol (DI via argumen/django-injector)
- Controller          → DRF ViewSet / APIView
- Validasi            → DRF Serializer
- Error terpusat      → DRF custom exception handler
- RBAC                → DRF Permissions + Groups / django-guardian
- ORM/Migration       → Django ORM + migrations
- View                → Django Templates + Tailwind
- Landing + FE template → template publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → django-environ
- Test                → pytest-django + DRF APITestCase + behave/pytest-bdd
- Checker             → custom management command + ruff + mypy
- /make-module        → manage.py startapp + template custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, generator app,
dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 5. .NET Core (C# / ASP.NET Core)

Scaffold:
```bash
dotnet new webapi -n DotNetAdmin   # nama baku: DotNetAdmin (atau: dotnet new mvc)
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.5 .NET Core), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md.

Target: {PATH_TARGET} (ASP.NET Core kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE ASP.NET Core. Pemetaan:
- Modular per fitur   → folder Feature (Vertical Slice) / Class Library per modul
- DI                  → IServiceCollection (AddScoped, dll) di Program.cs
- Service + Interface → interface IXService + impl
- Controller          → [ApiController] / Minimal API
- Validasi            → FluentValidation (atau DataAnnotations + ModelState)
- Error terpusat      → Exception middleware / IExceptionHandler (.NET 8)
- RBAC                → ASP.NET Identity + Authorization Policy/[Authorize(Roles)]
- ORM/Migration       → Entity Framework Core + Migrations
- View                → Razor + Tailwind (atau API + SPA)
- Landing + FE template → Razor publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → appsettings.json + Options pattern IOptions<T>
- Test                → xUnit + WebApplicationFactory + Testcontainers
- BDD                 → SpecFlow / Reqnroll
- Checker             → Roslyn Analyzer custom + EditorConfig
- /make-module        → dotnet new template custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, dotnet template,
dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 6. Rust (Rocket)

Scaffold:
```bash
cargo new RustAdmin && cd RustAdmin   # nama baku: RustAdmin (tambah rocket, sea-orm di Cargo.toml)
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.6 Rust/Rocket), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md.

Target: {PATH_TARGET} (Rust + Rocket kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE Rust/Rocket. Pemetaan:
- Modular per fitur   → module (mod) per fitur / crate workspace
- Service + Interface → trait + struct impl (DI via Rocket managed State<T> / shaku)
- Controller          → Rocket route handler (#[get]/#[post] + guards)
- Validasi            → struct + validator crate + FromForm/Json<T> guard
- Error terpusat      → enum AppError + impl Responder
- RBAC                → Rocket Request Guard custom (cek role/permission)
- ORM/Migration       → Diesel atau SeaORM + migrations
- View                → Tera/Handlebars + Tailwind
- Landing + FE template → view publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → figment / dotenvy + struct config
- Test                → #[test] + rocket::local client + cucumber crate (BDD)
- Checker             → clippy lint custom + script CI
- /make-module        → cargo generate template / script

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, generator,
dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 7. Go (Gin)

> **Gin, bukan Fiber**: Gin di atas `net/http` standar → seluruh ekosistem lib Go (OSS SDK, OAuth, middleware, observability) langsung kompatibel. Fiber pakai `fasthttp` (non-standar) → sering perlu adapter. Untuk admin panel, throughput bukan bottleneck (DB/IO yang dominan), jadi kompatibilitas Gin lebih bernilai.

Scaffold:
```bash
mkdir GoAdmin && cd GoAdmin   # nama baku: GoAdmin
go mod init goadmin
go get github.com/gin-gonic/gin gorm.io/gorm github.com/golang-jwt/jwt/v5 \
  github.com/spf13/viper github.com/gin-contrib/sessions github.com/go-playground/validator/v10
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.7 Go/Gin), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md untuk KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah).

Target: {PATH_TARGET} (Go + Gin kosong, modul `goadmin`).
Buat bootstrap SETARA pakai IDIOM NATIVE Go/Gin. Pemetaan:
- Modular per fitur   → package per fitur (internal/modules/{modul}) + registrasi router eksplisit
- DI                  → constructor injection (wiring di main.go) atau google/wire
- Service + Interface → interface + struct impl (interface di sisi konsumen)
- Controller          → gin.HandlerFunc (*gin.Context), logika di service
- Validasi            → go-playground/validator + binding struct tag + DTO whitelist (anti mass-assign)
- Error terpusat      → AppError struct + middleware error (c.Error + handler), service return error → map ke HTTP
- RBAC                → middleware auth → authorize (role/permission) atau Casbin (casbin/gin)
- ORM                 → GORM (multi-DB via driver)
- Migration           → golang-migrate / goose (SQL portabel up/down) — bukan AutoMigrate utk produksi
- View + theme switcher → html/template (atau templ) + Tailwind + kolom theme DB (CSS var)
- Landing + FE template → view publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- Session/JWT         → gin-contrib/sessions + redis store; golang-jwt (HS256 di-pin) + blacklist via Redis
- Password/OTP        → bcrypt + OTP crypto/rand (hashed + expiry + rate-limit)
- Keamanan            → secure (helmet setara) + gin-contrib/cors + rate limit per-IP + gzip + static cache
- File storage        → aliyun-oss-go-sdk / aws-sdk-go-v2 (signed URL); Email → net/smtp / gomail
- env                 → viper + struct config + fail-fast (secret kosong di prod → panic)
- Graceful shutdown   → http.Server.Shutdown(ctx) pada SIGTERM/SIGINT
- Test                → testing + httptest (integration) + SQLite in-memory (glebarez/sqlite) + godog (BDD)
- Checker             → custom linter (go/ast) / golangci-lint custom rule + gate CI
- /make-module        → generator Go (text/template): go run ./cmd/make-module

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE + penuhi SELURUH Capability Checklist.
WAJIB hasilkan AGENTS.md versi Go, convention checker + CI, generator /make-module,
modul percontohan User/Role/Permission lengkap, halaman showcase komponen UI + docs/UI_COMPONENTS.md.
Kerjakan BERTAHAP (fondasi → modul percontohan → guardrail → sisanya), verifikasi tiap fase
(go build + go test ./... + checker hijau).
```

---

## Tips

- **Path absolut**: ganti `{PATH_NODEADMIN}` & `{PATH_TARGET}` dengan path nyata (mis. `/home/mulyawan/Project/Admin/NodeAdmin`).
- **Akses dua folder**: pastikan AI bisa membaca folder NodeAdmin (referensi) sekaligus menulis di folder target.
- **Jangan one-shot**: kalau AI langsung menulis semua, minta "rencanakan fase dulu, kerjakan fase 1 saja, lalu lapor".
- **Verifikasi tiap fase**: build + test + checker harus hijau sebelum lanjut.
- **Idiom > kemiripan**: kode harus terasa ditulis developer framework itu, bukan porting JS.
