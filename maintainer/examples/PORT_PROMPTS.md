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
| C++ (Drogon) | **CppAdmin** |
| Kotlin (Ktor) | **KotlinAdmin** |
| PHP Native | **PHPAdmin** |

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
- Pertahankan prinsip: SOLID/DI, DRY, SoC, Clean Code, error terpusat, RBAC, env tervalidasi, **theme switcher admin (DB-driven: N palet preset ala NodeAdmin + swatch pilih di Setting, diterapkan PER-REQUEST via CSS variable di chrome — REPLIKA palet PERSIS, jangan ubah/kurangi)**, **frontend template switcher (landing) + landing publik data-driven**, test wajib tiap fitur, guardrail.
- **WAJIB penuhi SELURUH "Capability Checklist" di PORTING_GUIDE Bagian 1** (keamanan: helmet/CSRF/rate-limit/JWT+sesi/bcrypt/OTP-hash/mass-assign/upload-magicbyte/secret-fail-fast; performa: kompresi/cache-setting/static-cache/pool/pagination/anti-N+1; arsitektur; multi-DB; fitur; testing; guardrail). App porting harus IDENTIK kapabilitasnya dengan NodeAdmin.
- **ORM WAJIB multi-database (dialect-agnostic) + migration kode portabel + tipe kolom abstrak** (lihat "Kriteria ORM & Migration" di PORTING_GUIDE Bagian 1). Test pakai SQLite in-memory. Hindari tipe/SQL vendor.
- **SKEMA DB IDENTIK LINTAS-PORT (WAJIB — agar satu DB bisa di-switch antar bahasa tanpa migrasi)**: setiap port HARUS menghasilkan skema **byte-identik** (lihat "Skema DB KANONIK" di PORTING_GUIDE Bagian 1). Hampir semua ORM menyusun daftar kolom SELECT dari model → **beda nama/keberadaan kolom = error runtime saat DB dipakai port lain**. Maka: **PIN nama tabel** (`users`/`roles`/`permissions`/`settings` — jangan andalkan auto-pluralize ORM), **PIN tabel join + kolomnya** (`users_roles(user_id,role_id)`, `roles_permissions(role_id,permission_id)` — default-naming join tiap ORM BEDA), **`id` = varchar(36) UUID string** (bukan auto-increment/`uuid` native), **status varchar (bukan ENUM)**, **`guard_name` varchar(20) def 'web'** (roles/permissions — jalur web/api untuk filter `q_guard`; permission auto-register dari route `api.*`→api), **kolom `desc`** (roles/permissions — reserved word, quote per-dialek / ORM auto-quote; jangan rename jadi `description` di satu port), **audit `created_by`/`updated_by`/`created_at`/`updated_at`**, keunikan sama (`users.code`/`users.email`/`roles.name` UNIK, `permissions.name` NON-unik). **Uji**: DB dibuat Port A → Port B pakai DB itu tanpa migrasi → login+CRUD jalan.
- Hasilkan juga: AGENTS.md versi target + convention checker + CI + equivalent `/make-module` + 1 modul percontohan (User/Role/Permission) lengkap + **halaman showcase komponen UI (`/admin/v1/components` setara) + docs/UI_COMPONENTS.md**.
- **PENAMAAN ROUTE SERAGAM (nama + path + METHOD persis NodeAdmin)**: named-route pola `{admin.v1|web|api.v1}.{modul}.{resource}.{aksi}`; resource access pakai **namespace `access` + singular** → web `/admin/v1/access/{user,role,permission}`, API `/api/v1/access/{...}`. Daftarkan SEMUA aksi **lengkap dengan method**: index GET, create GET, store POST `/store`, edit GET `/:id/edit`, **update PUT `/:id/update`**, **delete DELETE `/:id/delete`**, delete_selected POST `/delete_selected`. setting/profile update = **PUT `/update`**. **Method-override**: form HTML (GET/POST saja) memicu PUT/DELETE lewat `action=".../update?_method=PUT"` / `action=".../delete?_method=DELETE"` + wrapper yang mengubah method SEBELUM routing (Go/Gin: bungkus engine di level `http.Server`; override hanya POST→{PUT,PATCH,DELETE}). **Delete = form POST+`?_method=DELETE`** dgn `<button data-confirm>` (BUKAN `<a href>` GET) → konfirmasi pada submit form; form delete WAJIB sertakan CSRF token (DELETE = method unsafe). **Caveat CSRF+DELETE**: Express parse body by Content-Type → `_csrf` hidden body field cukup (NodeAdmin auto-inject). Go `net/http` TIDAK parse body form utk DELETE (hanya POST/PUT/PATCH) → middleware CSRF baca **body→query→header** & form delete taruh token di **query**: `action=".../delete?_method=DELETE&_csrf={{$._csrf}}"`. **API = SIMETRIS web, path VERBOSE (BUKAN REST)**: SELURUH CRUD API access pakai path & nama persis web (minus `create`): index `GET …/{resource}`, store `POST …/store`, edit `GET …/:id/edit`, update `PUT …/:id/update`, delete `DELETE …/:id/delete`, delete_selected `POST …/delete_selected` (body `{selected:[...]}`); nama `api.v1.access.{resource}.{aksi}` kembar `admin.v1.access.{resource}.{aksi}`. DILARANG REST (`GET/PUT/DELETE /:id`, `POST ``). Klien API (JWT) kirim method asli tanpa `?_method`. Registry named-route WAJIB method-aware. (Lihat "Named routes admin + METHOD" di PORTING_GUIDE.)
- **RBAC ROUTE-DRIVEN (WAJIB — bukan subject-based)**: permission = **(nama-route, method, guard)** mis. `{name:"admin.v1.access.user.delete", method:"DELETE", guard:"web"}` — BUKAN subjek `user.delete`. **Di-scan OTOMATIS dari registry named-route** (padanan NodeAdmin `getAllRegisteredRoute`): tiap route bernama → 1 permission; guard dari prefix nama (`api.`→api, lainnya→web); sync **lazy saat buka halaman Permission** + sekali setelah route terdaftar (boot). JANGAN hardcode daftar permission. Middleware **authorize TANPA argumen** → turunkan `(nama, method)` dari request (method + pola-path/FullPath → reverse-lookup nama route) → `HasAccess(name, method)`. Cocokkan **name AND method** (GET vs DELETE path sama = izin beda). Urutan **authenticated → authorize**, Administrator **bypass**. Sidebar gating `hasAccess(currentUser, "nama.route", "GET")`. (Anti-pattern Go yang sempat terjadi: RBAC subject-based + daftar `CorePermissions` tetap → menyimpang dari NodeAdmin; HARUS route-driven.)
- **REPLIKA UI ADMIN 1:1 (WAJIB, sering terlewat → app porting jadi "beda tampilan/menu/tabel")**: JANGAN bikin UI versi sendiri. Replikasi PERSIS layout/chrome (head/sidebar/topbar/foot) + **struktur menu** + **SEMUA halaman** (dashboard, UI components showcase, setting, profile, auth login/**register**/forgot/reset, form create/edit) + **SEMUA tabel index** dari NodeAdmin (lihat PORTING_GUIDE Bagian "Standar UI Admin & Struktur Menu (WAJIB 1:1)"). Patuhi **Manifest file sumber** (tiap layout+view di-replika 1:1) & **Struktur tabel index kanonik**: thead **2 baris** (filter per-kolom + header), **select-all**, **page-size** selector, **Delete Selected** (bulk), **filter per-kolom server-side** (`q_*`), Status sebagai **ikon**, role/method sebagai **badge**, **action dropdown** (Edit/Delete; **modul Role WAJIB + item "Permission"** `fa-key` → **halaman assign/unassign permission TERPISAH**: 5 route `role/:id/permission` GET list + `.../:permission_id/assign|unassign` GET single + `.../assign_selected|unassign_selected` POST bulk, view `roles/permission` dgn kolom Status=ikon assigned + filter `q_status` Active/Inactive — BUKAN cuma `permission_ids[]` di form edit), **pagination yang MEMPERTAHANKAN filter** (waspada: template engine yang auto-escape atribut URL dapat merusak query-string gabungan `key=val&…` → pakai tipe URL tepercaya/helper, bukan rangkai string mentah). **Entity Role & Permission WAJIB bawa kolom**: Role `status`(default Active)+`description`; Permission `method`+`status`+`description` (JANGAN sederhanakan jadi name-only mis. gaya Spatie — itu memicu tabel berbeda). Anti-pattern: mengandalkan "test render hijau" tanpa membandingkan kolom/markup tabel terhadap NodeAdmin.
- **Modul Landing + Frontend Template Switcher** (lihat checklist "Fitur Fungsional" PORTING_GUIDE): katalog desain landing dari sumber eksternal — **daftar di server sekali (cache + fallback kurasi)**, **paginasi + search server-side** (12/halaman, item aktif ke hal 1, **pagination WINDOWED** `1/…/cur±2/…/last` bukan semua nomor), **thumbnail = iframe `srcdoc`** (HTML di-fetch klien + cache localStorage, BUKAN `<iframe src=/preview>` langsung → itu bikin thumbnail gagal) ter-scale + **lazy IntersectionObserver** + **`forceLight()`** (paksa light agar template `dark:` tak gelap) + **modal preview**, **pemilihan via hidden input `fe_template` + form Setting utama** (PILIH/TERPILIH + localStorage, unduh saat Save — bukan endpoint apply terpisah; search = form GET terpisah), **anti-SSRF** (whitelist katalog/pola slug `{kategori}-{NNN}-{nama}`), **unduh on-demand + cache lokal** saat disimpan. **Model render PRESISI**: katalog = **GitHub tree opentailwind (≈640 landing)** di-cache (memo 6 jam + disk `_catalog.json`), fallback kurasi 15; **SATU default = slug nyata `agency-consulting-002-creative-agency`** (BUKAN "default"/"minimal" karangan) dirender via **view native kaya** (fe/default); ≈640 lainnya = HTML mentah diunduh dari `RawBaseURL/{slug}.html`. JANGAN bikin builtin karangan sendiri. **Landing default bind ke Setting** (nama/logo/deskripsi/kontak/copyright, guard+fallback) sebagai sample data-driven. **Routing**: root `/` **render halaman home LANGSUNG** (bukan redirect), `/home` alias; login eksplisit di `/auth/login`; daftarkan `/` **di modul home** (setelah middleware layout aktif), bukan root-handler inti, agar layout publik penuh ter-render. **Proxy preview tahan-banting (server-side)**: cache lokal dulu → fetch upstream pakai timeout → fallback ke cache lokal saat gagal (cegah "gagal memuat preview" akibat blip jaringan).
- **Robustness runtime/dev**: (a) **listen/bind error fail-fast** — tangani EADDRINUSE (port dipakai) dengan pesan jelas + exit non-zero, jangan biarkan proses mati senyap; (b) **dev hot-reload jangan restart karena data runtime** — kecualikan direktori cache/unduhan dari watcher dev & batasi watch ke folder sumber (penulisan cache di tengah request → restart → tampak "app mati").
- **Varian Full (UI + API) vs API-only** dari **satu basis kode**, dipilih runtime via env (mis. `APP_MODE=full|api`): mode `api` melewati lapisan web (session/static/layout/route web) → REST + JWT saja; mode `full` memasang semuanya. Pastikan **diff antar-varian purely-additive** (file shared identik di kedua mode — cabang via env/guard runtime, modul UI didaftarkan dengan guard kehadiran) sehingga API-only = Full dikurangi file UI utuh, dan install API-only bisa **di-upgrade ke Full** lewat **command idempotent** (mis. `add-ui` setara) yang menyalin file UI yang absent + set `APP_MODE=full` lalu memverifikasi (checker + typecheck + test). Jangan bikin dua project terpisah yang gampang divergen.
- **Kualitas yang sering terlewat** (pelajaran NodeAdmin): (a) **uji blacklist JWT secara nyata** (login→200→logout→401) memakai store yang berperilaku seperti runtime — mock yang selalu mulus bisa menyembunyikan kegagalan senyap; (b) **mock dependency harus setia-perilaku** (API/sync-async sama persis dgn runtime); jalur auth kritis tambahkan test integrasi store nyata; (c) test resilience/fallback yang memicu error → spy+assert logger (bukan kebisingan); (d) **bebas API/dependency usang** — jangan pakai API deprecated (mis. yang hilang di versi mayor berikutnya) atau lib tak-terawat yang memicu deprecation runtime; output rilis harus bebas-deprecation; (e) **seed/migrasi IDEMPOTEN** — seeder & dev-bootstrap aman dijalankan berulang (cek-lalu-buat eksplisit by unique key; HINDARI upsert/`FirstOrCreate` dengan struct yang sudah memuat PK → PK ikut masuk kondisi pencarian → baris lama tak ketemu → INSERT duplikat → `UNIQUE constraint failed`); uji dengan menjalankan seed ≥2x.
- **Pelajaran porting RustAdmin (WAJIB cek manual via browser/curl — sering lolos test tapi bikin app rusak/beda)** — lihat "Pelajaran porting lanjutan (RustAdmin/Rocket)" di PORTING_GUIDE: (1) **render view ber-`Content-Type: text/html`** (engine yang memberi `text/plain` + `nosniff` → browser tampil HTML mentah; uji `curl -I /`); (2) **belum-login akses route web ter-autentikasi → REDIRECT `/auth/login`** (BUKAN 401/404), API → 401 JSON — bila guard tak bisa redirect, pakai catcher/error-handler terpusat; (3) **app self-bootstrap di dev** (`run` non-prod auto-migrate+seed, tak gagal `no such table`; seed idempoten); (4) **login = 2 PANEL 1:1** (panel kiri `sidebar-gradient`+login_image, panel kanan logo+"Hello, Welcome Back!"+email/password+Login+Keep-me-logged-in/Forgot+`create here`) — bukan kartu tunggal; (5) **dashboard/components/profile/setting konten PENUH** (Profile = FORM USER penuh: code/name/phone/email/timezone/password+confirm/status/picture; Dashboard = 4 stat-card+counter+2 chart+activities+top-products+orders-table; Components = 9 seksi; Setting = swatch tema 4-strip + katalog FE + form lengkap label `[field]`+preview gambar) — JANGAN versi ringkas; (6) **frontend template switcher harus BENAR-BENAR berfungsi** (fetch katalog live + HTML asli + landing benar-benar berganti saat Save — jangan berhenti di fallback kurasi/placeholder); (7) **autoescape + URL tepercaya** (engine yang autoescape `/` di output `route()/getFile()` → tandai `| safe`/jangan escape nilai URL); (8) **FIELD form/view = CERMIN PERSIS field + kolom DB NodeAdmin (TEKANAN UTAMA)** — tiap field WAJIB mengacu ke field+kolom DB NodeAdmin: keberadaan, nama, label, urutan, tipe input, validasi, DAN **desain+layout**-nya; JANGAN hilangkan field (kesalahan RustAdmin: form User TANPA field Picture) atau ubah desainnya. **Field gambar/file** (picture/icon/logo/login_image/avatar) = input **`.form-control` POLOS** (tombol native, jangan style `::file-selector-button`) + **`<img>` preview SELALU render tanpa guard `if`** (kosong/rusak → fallback global, BUKAN slot kosong/ikon manual; ANTI-PATTERN `{{if .Picture}}<img>{{else}}<i>{{end}}` — ditemukan di GoAdmin) + `previewImage()` + form `enctype="multipart/form-data"`. Verifikasi: cocokkan daftar field tiap form/view dengan **tabel kolom kanonik** — tak ada kolom berdata tanpa field UI, tak ada field karangan, desain/layout tiap field identik; (9) **resolusi path aset/template/cache/upload JANGAN relatif-CWD** (bug RustAdmin: panic "is not a directory" saat dijalankan dari folder lain) — resolve dari basis stabil (root app terdeteksi / classpath Spring / `ContentRootPath` .NET), uji jalankan dari direktori lain.
- BERTAHAP: fondasi → modul percontohan → guardrail → sisanya. Verifikasi tiap fase.

---

## 1. Laravel (PHP)

> **Versi target: Laravel 13.x + PHP 8.3+** (latest: v13.16.1, rilis Juni 2026). `composer create-project laravel/laravel LaravelAdmin` otomatis mengunduh L13.
>
> ⚠️ **Perubahan struktural L11+ yang WAJIB diikuti** (JANGAN ikuti tutorial lama/L10):
> - Exception handler → `bootstrap/app.php` `->withExceptions(...)` (**bukan** `App\Exceptions\Handler.php` — dihapus)
> - Middleware → `bootstrap/app.php` `->withMiddleware(...)` (**bukan** `Kernel.php` — dihapus)
> - Service provider = **`AppServiceProvider` tunggal** (bukan banyak provider pisah)
> - Route API = **opt-in** via `php artisan install:api` (tidak ada secara default)
>
> **Fitur baru L13 yang dipakai**: `#[Middleware]`+`#[Authorize]` attribute di controller; `PreventRequestForgery` CSRF (origin-aware, bukan `VerifyCsrfToken`). ⚠️ **Pest belum support L13** (`pest-plugin-laravel` max `^12.x`) — gunakan **PHPUnit 12** (sudah bundled).

Scaffold:
```bash
composer create-project laravel/laravel LaravelAdmin   # nama baku: LaravelAdmin; otomatis L13
cd LaravelAdmin
php artisan install:api   # aktifkan routes/api.php + Sanctum (opt-in sejak L11)
composer require nwidart/laravel-modules spatie/laravel-permission
composer require --dev larastan/larastan   # PHPUnit 12 sudah bundled; Pest belum support L13
```

Prompt:
```
Saya punya bootstrap admin panel di {PATH_NODEADMIN} (Node.js/Express/TypeScript/TypeORM).
Baca untuk memahami KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah):
docs/PORTING_GUIDE.md (Bagian 1 + tabel 3.1 Laravel), AGENTS.md, docs/ARCHITECTURE.md,
docs/MODULE_GUIDE.md, docs/TESTING.md.

Target: {PATH_TARGET} (Laravel 13 kosong, PHP 8.3+, deps sudah dipasang).
Buat bootstrap SETARA dengan KONSEP SAMA pakai IDIOM NATIVE Laravel 13. Pemetaan:
- Versi target        → Laravel 13.x + PHP 8.3+; pakai rilis GA; JANGAN ikuti pola L10/tutorial lama
- Struktur L13        → exception handler di bootstrap/app.php →withExceptions() (BUKAN Handler.php); middleware di ->withMiddleware() (BUKAN Kernel.php); AppServiceProvider tunggal; route API opt-in (php artisan install:api)
- Modular per fitur   → nwidart/laravel-modules: php artisan module:make {Modul}; tiap modul punya ServiceProvider sendiri yang di-load otomatis
- DI                  → Service Container: bind IUserService::class→UserService::class di AppServiceProvider::register(); inject via constructor (auto-resolve)
- Service + Interface → interface IUserService + class UserService implements IUserService; bind di ServiceProvider
- Controller          → ResourceController (index/create/store/edit/update/destroy); L13: gunakan #[Middleware('auth')] + #[Authorize(...)] attribute di class/method (bukan middleware() di konstruktor)
- Validasi            → FormRequest ($request->validated() — whitelist otomatis, anti mass-assignment); $request->safe()->only([...]) untuk subset
- Error terpusat      → Exception custom + bootstrap/app.php ->withExceptions(fn(Exceptions $e) => $e->renderable(fn(AppException $ex, $req) => ...)); petakan ke HTTP (web→flash+redirect, API→JSON)
- RBAC route-driven   → spatie/laravel-permission + middleware permission:/role:; sync permission dari named route via Artisan command custom (scan Route::getRoutes() → upsert permission DB); Administrator bypass; sidebar gating $user->can('admin.v1.access.user.index')
- ORM/Migration       → Eloquent + migration Laravel (DB-agnostik, tipe abstrak bukan vendor); PIN $table='users' eksplisit; $guarded=['*']+$fillable=[...] eksplisit; many-to-many: belongsToMany(Role::class,'users_roles','user_id','role_id') PIN semua argumen
- Route API           → php artisan install:api (sudah dipasang); JWT via Laravel Sanctum atau firebase/php-jwt; blacklist token via Redis saat logout
- View + theme switcher → Blade ({{ $var }} auto-escape, {!! $safeHtml !!} raw) + Tailwind; View::share(['theme'=>$theme,...]) di AppServiceProvider::boot() → CSS vars di layout
- CSRF (L13)          → PreventRequestForgery middleware (bawaan L13, terdaftar otomatis); @csrf + @method('DELETE') di Blade; JANGAN extend VerifyCsrfToken lama
- Method-override     → bawaan Laravel: @method('PUT')/@method('DELETE') di Blade; tidak perlu middleware tambahan
- Landing + FE template → Blade publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- Test                → PHPUnit 12 (bundled, pakai langsung tanpa install); Feature test: `public function test_user_index(): void { $this->actingAs($user)->get('/admin/v1/access/user')->assertOk(); }` di class extends TestCase; ⚠️ Pest belum support L13 — jangan install pest-plugin-laravel
- Convention checker  → Artisan command custom + Pint (formatter) + Larastan level 8; Composer script "check": ["pint --test","phpstan analyse","phpunit"] → CI gate
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom q_*, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all #checkall), Rich Text Editor Trumbowyg + FILE MANAGER (modul media: GET/POST /admin/v1/media/list|upload|delete → simpan ke folder editor/ storage, validasi magic-byte, CSRF via header; plugin filemanager.js modal upload/list/hapus+sisip <img>), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), landing fe/default = halaman RICH multi-seksi + aset css/style.css+js/motion.js (bukan placeholder), input file .form-control POLOS (tombol native—JANGAN style ::file-selector-button custom)+preview gambar SELALU dirender (<img> tanpa guard if; src kosong/rusak → fallback gambar GLOBAL di foot: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon fa-image/fa-user, JANGAN biarkan slot kosong); deskripsi Setting pakai trumbowyg-editor (rich editor+file manager) → HTML disanitasi server saat simpan (HTML Purifier atau strip_tags whitelist) + dirender MENTAH ({!! $safeHtml !!}) di landing; login Keep-me-logged-in+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK) → PIN $table='users' eksplisit tiap model; PIN tabel join users_roles(user_id,role_id)+roles_permissions(role_id,permission_id) di belongsToMany semua argumen; id varchar(36) UUID; status varchar (bukan ENUM); guard_name varchar(20) def 'web'; kolom desc (Eloquent auto-quote aman; migration: $table->string('desc',255)->nullable()); audit created_by/updated_by; permissions.name NON-unik
- /make-module        → nwidart/laravel-modules: php artisan module:make {Modul} (atau custom stub artisan command)

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE. WAJIB hasilkan AGENTS.md Laravel 13,
convention checker (Pint+Larastan) + CI, php artisan module:make generator,
varian Full/API-only (APP_MODE) + command upgrade idempoten, modul percontohan User/Role/Permission.
Kerjakan BERTAHAP, rencanakan fase dulu, verifikasi tiap fase (./vendor/bin/phpunit + composer check hijau).
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
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
- /make-module        → Nest CLI schematic custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, schematic
generator, dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 3. Spring Boot (Java)

Scaffold: buat project di https://start.spring.io — **Spring Boot 3.5.x (stabil) + Java 21 LTS**, build Maven (artifact/nama baku: **SpringAdmin**; deps: Web, Data JPA, Security, Validation, **Flyway Migration**, driver DB). Pakai rilis GA (hindari milestone/SNAPSHOT).

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.3 Spring Boot), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md.

Target: {PATH_TARGET} (Spring Boot kosong).
Buat bootstrap SETARA pakai IDIOM NATIVE Spring. Pemetaan:
- Versi target       → **Spring Boot 3.5.x + Java 21 LTS** (Maven); pakai rilis GA (hindari milestone/SNAPSHOT)
- Modular per fitur   → package per fitur / Maven module
- DI                  → @Service/@Component + @Autowired
- Service + Interface → interface + @Service impl
- Controller          → @RestController / @Controller
- Validasi            → Bean Validation @Valid + DTO
- Error terpusat      → @ControllerAdvice + @ExceptionHandler
- RBAC                → Spring Security + @PreAuthorize
- ORM/Migration       → Spring Data JPA/Hibernate + **Flyway/Liquibase** (migration kode portabel up/down, dev auto-apply). **DDL kanonik WAJIB via Flyway/Liquibase — BUKAN `hibernate.ddl-auto=create/update`** (auto-DDL tak mem-PIN nama tabel join `users_roles`/`roles_permissions`, kolom `desc`, `id varchar(36)`, `guard_name` → skema BEDA → DB tak bisa di-switch antar-port). Set `spring.jpa.hibernate.ddl-auto=validate` saja (Hibernate cuma memvalidasi skema buatan Flyway)
- View                → Thymeleaf + Tailwind (atau REST + SPA). Thymeleaf set `Content-Type: text/html` otomatis + `th:href`/`th:src` aman dari autoescape URL (pelajaran #1 & #7 PORTING_GUIDE)
- Landing + FE template → view publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → application.yml + @ConfigurationProperties
- Test                → JUnit 5 + MockMvc + Testcontainers
- BDD                 → Cucumber-JVM
- Checker             → ArchUnit + Checkstyle/SpotBugs
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
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
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
- /make-module        → manage.py startapp + template custom

Pertahankan SEMUA prinsip Bagian 1. WAJIB hasilkan AGENTS.md, checker + CI, generator app,
dan modul percontohan User/Role/Permission. BERTAHAP + verifikasi tiap fase.
```

---

## 5. .NET Core (C# / ASP.NET Core)

Scaffold:
```bash
dotnet new webapi -n DotNetAdmin --framework net10.0   # .NET 10 LTS (C# 14); nama baku: DotNetAdmin (atau: dotnet new mvc)
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
- Method-override     → ASP.NET Core **TANPA override bawaan** (beda dari Spring) → tambah **middleware kustom** translate `POST`+`?_method=PUT|DELETE` ke method asli **SEBELUM `UseRouting()`**, lalu `[HttpPut]/[HttpDelete]`; antiforgery token via header/query (bukan body, karena DELETE)
- RBAC                → ASP.NET Identity + Authorization Policy/[Authorize(Roles)]. Belum-login: web → redirect `/auth/login`, `/api/**` → 401 JSON (set `Events.OnRedirectToLogin` agar path `/api` balas 401, bukan 302)
- ORM/Migration       → Entity Framework Core + Migrations (dev auto-apply `db.Database.Migrate()`; PIN nama tabel/join/`desc`/`id varchar(36)` via Fluent API `ToTable()`/`HasColumnName()` — jangan andalkan konvensi EF)
- Path aset/cache     → `IWebHostEnvironment.ContentRootPath`/`WebRootPath` + `Path.Combine` (bukan `Directory.GetCurrentDirectory()` mentah) agar jalan dari direktori mana pun (pelajaran #9 PORTING_GUIDE)
- View                → Razor + Tailwind (atau API + SPA). Razor `@` autoescape (`Html.Raw` utk HTML setting tersanitasi); set `Content-Type: text/html`
- Landing + FE template → Razor publik (bind Setting) + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand)
- env                 → appsettings.json + Options pattern IOptions<T>
- Versi target       → **.NET 10 LTS (C# 14) — `--framework net10.0`**, **EF Core 10**; pin paket versi GA (JANGAN preview/rc); pola modern `Program.cs` minimal-hosting (BUKAN `Startup.cs` lama)
- Test                → xUnit + WebApplicationFactory + Testcontainers
- BDD                 → **Reqnroll** (penerus SpecFlow — SpecFlow sudah discontinued; JANGAN pakai SpecFlow)
- Checker             → Roslyn Analyzer custom + EditorConfig
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
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
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
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
- Home + FE template  → modul `home`: root `/` render home LANGSUNG (bukan redirect), `/home` alias, login di `/auth/login`; view publik bind Setting + katalog landing (paginasi/search server-side, thumbnail/preview cache-klien, unduh on-demand). Proxy preview server-side tahan-banting: cache lokal dulu → fetch upstream pakai timeout → fallback ke lokal saat gagal
- Session/JWT         → gin-contrib/sessions + redis store; golang-jwt (HS256 di-pin) + blacklist via Redis
- Password/OTP        → bcrypt + OTP crypto/rand (hashed + expiry + rate-limit)
- Keamanan            → secure (helmet setara) + gin-contrib/cors + rate limit per-IP + gzip + static cache
- File storage        → aliyun-oss-go-sdk / aws-sdk-go-v2 (signed URL); Email → net/smtp / gomail
- env                 → viper + struct config + fail-fast (secret kosong di prod → panic)
- Graceful shutdown   → http.Server.Shutdown(ctx) pada SIGTERM/SIGINT
- Listen error fail-fast → cek error `srv.ListenAndServe()` (mis. port dipakai/EADDRINUSE) → log jelas + exit non-zero; jangan abaikan error-nya
- Test                → testing + httptest (integration) + SQLite in-memory (glebarez/sqlite) + godog (BDD)
- Checker             → custom linter (go/ast) / golangci-lint custom rule + gate CI
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom `q_*`, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all `#checkall`), Rich Text Editor Trumbowyg **+ FILE MANAGER** (modul `media`: `GET/POST /admin/v1/media/list|upload|delete` → simpan ke folder `editor/` storage, validasi magic-byte, CSRF via header; plugin `filemanager.js` modal upload/list/hapus+sisip `<img>`), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), **landing `fe/default` = halaman RICH multi-seksi + aset `css/style.css`+`js/motion.js` (bukan placeholder)**, input file `.form-control` POLOS (tombol native—JANGAN style `::file-selector-button` custom)+**preview gambar SELALU dirender** (`<img>` tanpa guard `if`; src kosong/rusak → **fallback gambar GLOBAL di foot**: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon `fa-image`/`fa-user`, JANGAN biarkan slot kosong); **deskripsi Setting pakai `trumbowyg-editor`** (rich editor+file manager) → HTML disanitasi server saat simpan (bluemonday/sanitize-html) + dirender MENTAH (`safeHTML`/`<%- %>`) di landing; login 'Keep me logged in'+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK, bisa di-switch antar bahasa tanpa migrasi) → PIN nama tabel (`users`/`roles`/`permissions`/`settings`) + tabel join (`users_roles(user_id,role_id)`/`roles_permissions(role_id,permission_id)`); `id` varchar(36) UUID (bukan auto-inc/uuid-native); status varchar (bukan ENUM); roles/permissions bawa `guard_name`(web/api, untuk filter q_guard)+`status`+`desc`(reserved-word—jangan rename ke description di satu port)+`method` (bukan name-only); audit `created_by`/`updated_by`; `permissions.name` NON-unik
- /make-module        → generator Go (text/template): go run ./cmd/make-module
- Varian Full vs API-only → build tag / `APP_MODE` env pilih mode di main.go (mode api skip router web, hanya REST+JWT; modul UI didaftarkan dgn guard kehadiran). Diff antar-varian purely-additive. Upgrade API→Full → `go run ./cmd/add-ui` (salin paket/aset UI yg absent + set APP_MODE=full) lalu go build + go test ./...

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE + penuhi SELURUH Capability Checklist.
WAJIB hasilkan AGENTS.md versi Go, convention checker + CI, generator /make-module,
varian Full/API-only (APP_MODE) + command upgrade add-ui,
modul percontohan User/Role/Permission lengkap, halaman showcase komponen UI + docs/UI_COMPONENTS.md.
Kerjakan BERTAHAP (fondasi → modul percontohan → guardrail → sisanya), verifikasi tiap fase
(go build + go test ./... + checker hijau).
```

---

---

## 8. C++ (Drogon)

> **Kenapa Drogon**: framework C++ paling lengkap & aktif untuk admin panel penuh — async/coroutine native (C++20), ORM built-in (model generate dari DB), CSP template engine (compile-time, mirip EJS), session + gzip + static file bawaan.
>
> ⚠️ **Baca dulu perbedaan fundamental di PORTING_GUIDE tabel 3.8 sebelum mulai** — terutama: (1) template CSP **compile-time** (bukan runtime → ubah template = rebuild), (2) **no named routes bawaan** (wajib bangun `RouteRegistry` manual), (3) **no migration bawaan** (pakai dbmate), (4) **no auto-escape** di CSP, (5) **no method-override bawaan** (custom `HttpFilter`).

Scaffold:
```bash
# Prasyarat: install Drogon (via vcpkg: vcpkg install drogon, atau build manual)
# Pastikan: cmake ≥ 3.16, gcc/clang C++20, drogon_ctl tersedia di PATH
drogon_ctl create project CppAdmin   # nama baku: CppAdmin
cd CppAdmin
# Tambah deps di CMakeLists.txt:
# - jwt-cpp (header-only JWT)
# - nlohmann/json (JSON parsing)
# - libbcrypt atau OpenSSL (password hashing)
# - hiredis (Redis client, untuk session store + JWT blacklist)
# - dbmate (migration tool, install terpisah sebagai binary)
# - libcurl atau POCO (email SMTP)
# - aws-sdk-cpp atau libosspor (S3/OSS storage, opsional)
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.8 C++/Drogon), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md untuk KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah).

Target: {PATH_TARGET} (C++ + Drogon kosong, project sudah di-scaffold drogon_ctl).
Buat bootstrap SETARA pakai IDIOM NATIVE C++/Drogon. Nama app baku: CppAdmin.

BACA DULU dan PAHAMI perbedaan fundamental Drogon vs port lain (di PORTING_GUIDE tabel 3.8):
CSP = compile-time (bukan runtime — ubah template = wajib rebuild); no named routes bawaan
(wajib bangun RouteRegistry singleton manual untuk RBAC route-driven); no migration bawaan
(pakai dbmate — SQL plain); no auto-escape CSP (buat htmlEscape helper, pakai konsisten);
method-override + CSRF = custom HttpFilter global.

Pemetaan:
- Versi target        → C++20, Drogon 1.9.x (stabil), CMake ≥ 3.16, vcpkg untuk deps
- Modular per fitur   → namespace/folder per fitur (controllers/models/services/filters/) + CMakeLists.txt per modul
- DI                  → Drogon IoC app().registerObject<T>() + constructor injection manual (wiring di main.cc); DROGON_PLUGIN untuk plugin global
- Service + Interface → pure-virtual class (interface) + concrete struct impl; inject via konstruktor controller
- Controller tipis    → HttpController<T> + METHOD_LIST_BEGIN / ADD_METHOD_TO(T, handler, "/path", Method); delegate ke service
- Validator           → whitelist struct binding (parse hanya field dikenal dari nlohmann/json atau req->getBody()); validasi eksplisit di service (required/format/max)
- Error terpusat      → custom exception class + app().setExceptionHandler() → web: flash+redirect; API: JSON 4xx/5xx
- Named routes (WAJIB bangun manual) → RouteRegistry singleton (std::unordered_map nama→{method,path}) isi saat bootstrap; scan ke permission DB saat halaman Permission dibuka; RBAC filter reverse-lookup (method,path)→name→HasAccess; cocokkan name AND method
- RBAC route-driven   → custom HttpFilter (auth filter → RBAC filter → controller); permission = (nama-route, method, guard); Administrator bypass; sidebar gating via HasAccess
- Migration          → dbmate (SQL plain, multi-DB, CLI: dbmate up/down/new); file db/migrations/TIMESTAMP_name.sql; JANGAN andalkan drogon_ctl create model untuk DDL — itu codegen-only dari DB yang sudah ada
- ORM/Model          → Drogon ORM: drogon_ctl create model (regenerate setelah migrasi); Mapper<T> untuk CRUD; async co_await; PIN tableName() eksplisit di tiap model class
- View+theme switcher → CSP (.csp → compile ke .cc) + Tailwind + theme dari DB (inject CSS vars ke HttpViewData tiap render); htmlEscape helper WAJIB untuk semua konten user; Content-Type: text/html (set via HttpResponse::setContentTypeCodeAndCustomString)
- env                 → config.json (Drogon native: app().loadConfigFile()) + std::getenv untuk secret; struct AppConfig tervalidasi di startup (secret kosong → LOG_FATAL + exit(1))
- Session (web)       → Drogon built-in session (req->session()) + Redis via RedisClientPlugin (config.json: enable_session:true, session_timeout:3600)
- JWT (API)           → jwt-cpp (header-only, HMAC-SHA256) + blacklist via Redis (SET jti "1" EX ttl); verifikasi: signature + exp + blacklist
- Password/OTP        → bcrypt (libbcrypt/OpenSSL EVP) + OTP RAND_bytes (OpenSSL) → hex → hash → simpan + expiry bigint (epoch ms) + rate-limit per-IP (Redis counter TTL)
- Rate limit          → custom HttpFilter per-IP: Redis INCR/EXPIRE sliding window; daftarkan di endpoint sensitif
- Security headers    → custom global HttpFilter (HSTS/X-Frame-Options/X-Content-Type-Options/CSP); CORS via app().addAllowedOrigin()
- CSRF               → custom CsrfFilter: generate token (session), inject ke response web (locals HttpViewData), validasi POST/PUT/PATCH/DELETE; form multipart → token di query (DELETE tidak parse body — sama caveat Go)
- Method-override     → custom global MethodOverrideFilter: baca ?_method=PUT|DELETE dari POST, set req->setMethod() SEBELUM controller; form delete: token di query action="…?_method=DELETE&_csrf=TOKEN"
- Kompresi/static     → app().enableGzip(true); static files Cache-Control via app().setStaticFilesCacheTime()
- Path aset/template  → resolve ABSOLUT dari argv[0]/CMAKE_INSTALL_PREFIX saat startup (app().setDocumentRoot(), app().setViewsPath(), cache dir); JANGAN path relatif-CWD
- File storage        → aws-sdk-cpp (S3/compatible) atau Aliyun OSS C++ SDK + signed URL; validasi magic-byte (16 byte pertama); re-encode gambar via libvips atau stb_image
- Email (SMTP)        → libcurl SMTP atau POCO Net; template email HTML via CSP atau std::string builder
- Graceful shutdown   → signal handler SIGTERM/SIGINT → app().quit() + guard atomic<bool>
- Listen error fail-fast → tangkap exception saat app().run() bind gagal (port dipakai) → LOG_FATAL + exit(1)
- Flash+validasi inline → simpan errors+old ke session (satu-request) → redirect (PRG) → baca di controller → inject ke HttpViewData; CSP: <%c++ if(errors.count("name")) { %> is-invalid <%c++ } %>
- Test               → Drogon test framework (drogon::test::*) + gtest; test controller via HttpClient in-process; DB test pakai SQLite in-memory (override config JSON di test harness)
- BDD                → cucumber-cpp + gtest BDD-style .feature files + step definitions .cc
- Convention checker  → CMake target check_conventions: script Python/shell (grep + clang-tidy rule): service tanpa interface = fail; controller akses DB langsung = fail; getenv di modules/ = fail; gate CI
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom q_*, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all #checkall), Rich Text Editor Trumbowyg + FILE MANAGER (modul media: GET/POST /admin/v1/media/list|upload|delete → simpan ke folder editor/ storage, validasi magic-byte, CSRF via header; plugin filemanager.js modal upload/list/hapus+sisip <img>), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), landing fe/default = halaman RICH multi-seksi + aset css/style.css+js/motion.js (bukan placeholder), input file .form-control POLOS (tombol native—JANGAN style ::file-selector-button custom)+preview gambar SELALU dirender (<img> tanpa guard if; src kosong/rusak → fallback gambar GLOBAL di foot: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon fa-image/fa-user, JANGAN biarkan slot kosong); deskripsi Setting pakai trumbowyg-editor (rich editor+file manager) → HTML disanitasi server saat simpan + dirender MENTAH di landing; login Keep-me-logged-in+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK) → PIN tableName() eksplisit tiap model; PIN join table users_roles(user_id,role_id)+roles_permissions(role_id,permission_id) via SQL raw (Drogon ORM tidak manage M2M deklaratif); id varchar(36) UUID; status varchar; guard_name varchar(20) def 'web'; kolom desc (RESERVED — quote per-dialek: PG "desc", MySQL `desc`; di Drogon Criteria gunakan string quoted); audit created_by/updated_by; permissions.name NON-unik
- /make-module        → tools/make_module.sh (atau CMake target): generate folder+controller/service/filter/model/test dari template + tambah ke CMakeLists.txt
- Varian Full vs API-only → CMake option -DENABLE_WEB_UI=ON/OFF (atau APP_MODE env di main.cc): mode api skip CSP views+session+CSRF+static admin; guard: if (webUIEnabled) { registerWebModules(); }; upgrade: ./tools/add_ui.sh (salin file view/filter UI yang absent + set APP_MODE + cmake rebuild + run tests)

CATATAN KHUSUS DROGON (WAJIB DITERAPKAN):
- htmlEscape helper WAJIB di semua nilai konten user di CSP (auto-escape OFF): std::string h(str) → escape &<>"'
- Coroutine: handler yang query DB = drogon::AsyncTask atau Task<HttpResponsePtr>; pakai co_await mapper; jangan campurkan callback-style dan coroutine-style
- Setelah dbmate up: regenerate model via drogon_ctl create model (build gagal bila DB dan model class tidak sinkron)
- tableName() PIN eksplisit di TIAP model (default lowercase class name ≠ nama tabel kanonik)
- Session: config.json enable_session:true, session_timeout:3600; pastikan session middleware aktif
- CSP Content-Type: set HttpResponse::setContentTypeCodeAndCustomString(CT_TEXT_HTML, "text/html") — jangan biarkan default CT_APPLICATION_JSON

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE + penuhi SELURUH Capability Checklist.
WAJIB hasilkan AGENTS.md versi C++/Drogon, convention checker (CMake target) + CI,
tools/make_module.sh generator, varian Full/API-only (ENABLE_WEB_UI) + tools/add_ui.sh,
modul percontohan User/Role/Permission lengkap, halaman showcase komponen UI + docs/UI_COMPONENTS.md.
Kerjakan BERTAHAP (fondasi → modul percontohan → guardrail → sisanya), verifikasi tiap fase
(cmake build + ctest + convention checker hijau).
```

---

---

## 9. Kotlin (Ktor)

> **Kenapa Ktor**: framework Kotlin paling idiomatik untuk backend — coroutine native (`suspend fun`), plugin-based eksplisit (bukan convention magic), DSL routing Kotlin, ringan + kontrol penuh. Spring Boot (Kotlin) lebih "bawaan" tapi terasa seperti Java; Ktor terasa seperti Kotlin asli.
>
> ⚠️ **Baca dulu perbedaan fundamental di PORTING_GUIDE tabel 3.9** — terutama: (1) Ktor **sangat un-opinionated** (setiap fitur harus di-`install()` eksplisit); (2) **no named routes bawaan** (wajib bangun `RouteRegistry` manual); (3) **no built-in CSRF/method-override** (custom plugin); (4) **plugin order kritis** (install sebelum `Routing`); (5) **Exposed transaction wajib** untuk semua query ORM.

Scaffold:
```bash
# Buat project via Ktor Project Generator (IntelliJ plugin atau web):
# https://start.ktor.io → nama: KotlinAdmin, engine: Netty, plugins: Routing,
#   ContentNegotiation(kotlinx.serialization), FreeMarker, Sessions, Authentication,
#   StatusPages, Compression, CORS, RateLimit, StaticContent
# Atau via CLI:
mkdir KotlinAdmin && cd KotlinAdmin
# Inisialisasi Gradle Kotlin DSL manual (build.gradle.kts), lalu tambah deps:
# - io.ktor:ktor-server-netty:3.x
# - io.ktor:ktor-server-freemarker:3.x      (template engine)
# - io.ktor:ktor-server-sessions:3.x
# - io.ktor:ktor-server-auth-jwt:3.x
# - io.ktor:ktor-server-rate-limit:3.x
# - io.ktor:ktor-server-status-pages:3.x
# - org.jetbrains.exposed:exposed-core + exposed-dao + exposed-jdbc:0.55.x
# - org.flywaydb:flyway-core:10.x           (migration versioned)
# - io.insert-koin:koin-ktor:4.x            (DI)
# - org.mindrot:jbcrypt:0.4                 (bcrypt)
# - io.lettuce:lettuce-core:6.x             (Redis — session + JWT blacklist)
# - io.kotest:kotest-runner-junit5:5.x      (test)
# - io.cucumber:cucumber-kotlin:7.x         (BDD)
# - io.gitlab.arturbosch.detekt:detekt-gradle-plugin:1.x  (linter + checker)
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.9 Kotlin/Ktor), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md untuk KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah).

Target: {PATH_TARGET} (Kotlin + Ktor kosong, project sudah di-scaffold).
Buat bootstrap SETARA pakai IDIOM NATIVE Kotlin/Ktor. Nama app baku: KotlinAdmin.

BACA DULU dan PAHAMI perbedaan fundamental Ktor vs port lain (di PORTING_GUIDE tabel 3.9):
Ktor sangat un-opinionated (setiap fitur harus di-install() eksplisit — tidak ada otomatis);
no named routes bawaan (wajib bangun RouteRegistry singleton manual untuk RBAC route-driven);
no built-in CSRF dan no method-override bawaan (custom plugin, install SEBELUM Routing);
plugin order kritis (urutan install() = urutan eksekusi); Exposed transaction wajib untuk
semua query ORM (lazy-load tidak ada — eager dalam satu transaction).

Pemetaan:
- Versi target        → Ktor 3.x + Kotlin 2.x + Java 21 LTS, Gradle Kotlin DSL (build.gradle.kts); pakai rilis GA (hindari EAP/Alpha/Beta)
- Modular per fitur   → package modules/{modul}/ + Ktor Application extension function fun Application.featureModule(); tiap modul daftarkan route sendiri di {Modul}Routes.kt
- DI                  → Koin (io.insert-koin:koin-ktor): startKoin { modules(appModule) } di Application.module(); single<IUserService> { UserService(get()) }; inject di route: val svc by inject<IUserService>()
- Service + Interface → interface IUserService + class UserService : IUserService; Koin inject sisi konsumen pegang interface (Dependency Inversion)
- Controller tipis    → Ktor routing DSL: route("/admin/v1/access/user") { get { ... } post("/store") { ... } }; handler tipis, delegate ke service; routing di file {Modul}Routes.kt
- Validator           → Konform (io.konform:konform) atau Valiktor — validasi deklaratif; struct whitelist via data class (receiveOrNull<CreateUserDto>() + filter field eksplisit, anti mass-assignment)
- Error terpusat      → StatusPages plugin: install(StatusPages) { exception<AppException> { call, ex -> ... } } — petakan AppException ke HTTP (web→flash+redirect, API→JSON); JANGAN try/catch per-handler
- Named routes (WAJIB bangun manual) → RouteRegistry singleton; wrapper DSL namedGet/namedPost/namedPut/namedDelete(name, path, handler) mendaftarkan (name, method, path) ke registry saat boot; RBAC intercept reverse-lookup (method, path)→name→HasAccess; cocokkan name AND method
- RBAC route-driven   → custom plugin/interceptor: authenticated → authorize; permission=(nama-route, method, guard); scan OTOMATIS dari RouteRegistry ke DB saat halaman Permission dibuka; Administrator bypass; sidebar gating HasAccess
- Migration           → Flyway (org.flywaydb:flyway-core): SQL plain di resources/db/migrations/; auto-apply saat dev (Flyway.configure().dataSource(...).load().migrate() di startup); JANGAN SchemaUtils.create() di produksi
- ORM                 → Exposed DAO: object Users : UUIDTable("users") { ... } + class UserEntity(id) : Entity<...>(id); SEMUA query dalam transaction { } atau newSuspendedTransaction { }; eager-load relasi dalam satu transaction; PIN tableName di UUIDTable konstruktor
- View + theme switcher → FreeMarker (io.ktor:ktor-server-freemarker) + Tailwind; auto-escape HTML aktif (output_format="HTML"); inject theme/setting ke tiap FreeMarkerContent model map; Content-Type: text/html (FreeMarker set otomatis)
- env                 → HOCON application.conf (ktor native: environment.config.property(...).getString()) + data class AppConfig tervalidasi di startup (secret kosong → error("JWT_SECRET wajib diisi di produksi"))
- Session (web)       → Ktor Sessions plugin + custom Redis SessionStorage (Lettuce/Jedis); cookie<UserSession>("SESSION"); baca session SEBELUM receiveMultipart() (body habis setelah itu)
- JWT (API)           → Ktor Authentication+JWT plugin (io.ktor:ktor-server-auth-jwt) + blacklist token via Redis (setex jti ttl "1") saat logout; verifikasi: signature + exp + blacklist
- Password/OTP        → jBCrypt (org.mindrot:jbcrypt): BCrypt.hashpw(pwd, BCrypt.gensalt(rounds)); OTP via SecureRandom + hash + expiry currentTimeMillis() + rate-limit Redis counter TTL
- Rate limit          → Ktor RateLimit plugin (built-in Ktor 2.3+): install(RateLimit) { register(RateLimitName("login")) { ... } }; pakai rateLimited() di route sensitif
- Security headers    → custom plugin/intercept set HSTS/X-Frame-Options/X-Content-Type-Options; CORS plugin (install(CORS) { allowHost(...) })
- CSRF               → custom CsrfPlugin (createApplicationPlugin): generate token (simpan session), inject ke FreeMarker model, validasi POST/PUT/PATCH/DELETE; form DELETE: token di query (body tidak di-parse Ktor untuk DELETE)
- Method-override     → custom MethodOverridePlugin install SEBELUM Routing (phase Plugins.before(Routing)): baca ?_method=PUT|DELETE dari POST → call.attributes.put(OverriddenMethodKey, method) lalu handler dispatch manual berdasarkan atribut; form delete: _csrf di query action="…?_method=DELETE&_csrf=TOKEN"
- Flash+validasi inline → simpan errors:Map<String,String>+old:Map<String,String> di session (satu-request) setelah validasi gagal → redirect (PRG) → inject ke FreeMarker model; FreeMarker: <#if errors.name??> is-invalid </#if> + ${(old.name)!field.value}
- Kompresi/static     → Compression plugin (install(Compression) { gzip() }); staticResources("/assets", "assets") + Cache-Control via intercept; install static SEBELUM route dinamis
- File storage        → AWS SDK for Kotlin (aws.sdk.kotlin:s3) atau aws-java-sdk-s3 + signed URL; validasi magic-byte (16 byte pertama InputStream); re-encode via ImageIO
- Email (SMTP)        → Jakarta Mail (org.eclipse.angus:angus-mail) atau kotlin-mail; template email via FreeMarker string renderer
- Graceful shutdown   → embeddedServer(...).start(wait=false) + Runtime.getRuntime().addShutdownHook(Thread { server.stop(1000, 5000) })
- Listen error fail-fast → catch BindException saat server.start() → log port + exitProcess(1)
- Path aset/template  → FreeMarker load dari classpath (ClassTemplateLoader — aman di dalam JAR); direktori cache/upload = absolut dari env APP_ROOT atau System.getProperty("user.dir") di dev
- Test               → ktor-server-test-host (testApplication { application { module() }; client.get("/") }) + Kotest (io.kotest:kotest-runner-junit5) atau JUnit5 + Testcontainers; SQLite in-memory via Exposed (glebarez/sqlite-jdbc atau xerial) untuk test cepat
- BDD                → Cucumber-JVM (io.cucumber:cucumber-kotlin) + .feature files + step definitions .kt
- Convention checker  → Detekt (io.gitlab.arturbosch.detekt) + custom rule: service tanpa interface = error; handler akses DB langsung = error; System.getenv di modules/ = error; Gradle task detektMain di CI (./gradlew check)
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom q_*, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all #checkall), Rich Text Editor Trumbowyg + FILE MANAGER (modul media: GET/POST /admin/v1/media/list|upload|delete → simpan ke folder editor/ storage, validasi magic-byte, CSRF via header; plugin filemanager.js modal upload/list/hapus+sisip <img>), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), landing fe/default = halaman RICH multi-seksi + aset css/style.css+js/motion.js (bukan placeholder), input file .form-control POLOS (tombol native—JANGAN style ::file-selector-button custom)+preview gambar SELALU dirender (<img> tanpa guard if; src kosong/rusak → fallback gambar GLOBAL di foot: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon fa-image/fa-user, JANGAN biarkan slot kosong); deskripsi Setting pakai trumbowyg-editor (rich editor+file manager) → HTML disanitasi server saat simpan (jsoup Whitelist/Safelist) + dirender MENTAH (call.respondText(safeHtml, ContentType.Text.Html)) di landing; login Keep-me-logged-in+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK) → PIN tableName di UUIDTable("users") eksplisit tiap object; PIN join table: object UsersRoles : Table("users_roles") { val userId = varchar("user_id",36) references Users.id; val roleId = varchar("role_id",36) references Roles.id; override val primaryKey = PrimaryKey(userId, roleId) } (JANGAN biarkan Exposed auto-name); id = varchar(36) UUID string (UUIDTable pakai uuid natively → PIN sebagai varchar via IdTable<String> atau custom); status varchar (bukan ENUM); guard_name varchar(20) def "web"; kolom desc (Exposed auto-quote per dialek — aman di DAO, hati-hati di exec() raw); audit created_by/updated_by; permissions.name NON-unik
- /make-module        → Gradle task makeModule (buildSrc Kotlin script) atau tools/make_module.main.kts: generate folder + {Modul}Routes.kt/{Modul}Service.kt/I{Modul}Service.kt/{Modul}Repository.kt dari template string + tambah import ke modules.kt
- Varian Full vs API-only → env APP_MODE=full|api di Application.module(): mode api = skip install(Sessions), CsrfPlugin, FreeMarker, staticResources admin, route web; mode full = install semua. Guard: if (config.appMode == "full") { installWebModules() }. Upgrade: ./gradlew addUi (salin resource view yang absent + set APP_MODE=full + rebuild + test)

CATATAN KHUSUS KTOR (WAJIB DITERAPKAN):
- Plugin order kritis: MethodOverridePlugin install SEBELUM Routing; CsrfPlugin SEBELUM route handler; urutan install() di Application.module() = urutan eksekusi
- Exposed transaction wajib: SEMUA akses entity dalam transaction { } atau newSuspendedTransaction { }; akses di luar = LazyInitializationException; lazy-load tidak ada — eager load dalam satu transaction
- FreeMarker output_format="HTML": pastikan template root menyetel <#ftl output_format="HTML"> atau konfigurasi global agar ${user.name} ter-escape otomatis
- Session sebelum receiveMultipart(): baca/set session SEBELUM call.receiveMultipart() — body habis setelah receive
- Koin + Ktor: gunakan koin-ktor integration (Application.koin { } DSL) agar injection berjalan di coroutine scope yang benar; jangan inject manual via GlobalContext di handler
- Many-to-many PIN manual: definisikan object UsersRoles : Table("users_roles") eksplisit (jangan andalkan konvensi Exposed)

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE + penuhi SELURUH Capability Checklist.
WAJIB hasilkan AGENTS.md versi Kotlin/Ktor, convention checker Detekt + CI (./gradlew check),
Gradle task makeModule generator, varian Full/API-only (APP_MODE) + Gradle task addUi,
modul percontohan User/Role/Permission lengkap, halaman showcase komponen UI + docs/UI_COMPONENTS.md.
Kerjakan BERTAHAP (fondasi → modul percontohan → guardrail → sisanya), verifikasi tiap fase
(./gradlew build + ./gradlew test + ./gradlew detekt hijau).
```

---

---

## 10. PHP Native

> **Apa yang dimaksud "PHP Native"**: PHP tanpa framework penuh (bukan Laravel/Symfony) — Composer + PSR-4 autoloading + library **minimal bertujuan** (router, DI, ORM standalone, migration). Selebihnya memanfaatkan built-in PHP (`password_hash`, `session_*`, `PDO`, `finfo`, `GD`). Hasilnya terasa seperti PHP terstruktur PSR, bukan terjemahan Node.

Scaffold:
```bash
mkdir PHPAdmin && cd PHPAdmin
composer init --name=flazhost/phpadmin --type=project
composer require nikic/fast-route        # router ringan (dispatch cepat, regex)
composer require php-di/php-di           # DI container (PSR-11, autowiring)
composer require illuminate/database     # Eloquent standalone ORM (multi-DB)
composer require illuminate/pagination   # paginator Eloquent
composer require robmorgan/phinx         # migration portabel (bukan SQL vendor)
composer require respect/validation      # validasi deklaratif
composer require firebase/php-jwt        # JWT (API)
composer require predis/predis           # Redis (session store + JWT blacklist)
composer require phpmailer/phpmailer     # email SMTP
composer require aws/aws-sdk-php         # S3/OSS storage (opsional)
composer require vlucas/phpdotenv        # load .env
composer require --dev phpunit/phpunit
composer require --dev phpstan/phpstan
composer require --dev squizlabs/php_codesniffer
# Struktur folder:
# public/index.php      (front controller — satu-satunya pintu web)
# src/
#   Modules/{Modul}/    (Controller, Service, IService, Repository, Module)
#   Config/             (AppConfig, definitions.php, modules.php)
#   Core/               (Router, Middleware, Request, Response, helpers.php)
#   views/              (layouts/admin_head.php, layouts/admin_foot.php, …)
# db/migrations/        (Phinx migration PHP classes)
# storage/              (upload, cache katalog FE, editor/)
```

Prompt:
```
Referensi: {PATH_NODEADMIN} (Express/TS/TypeORM). Baca docs/PORTING_GUIDE.md
(Bagian 1 + tabel 3.10 PHP Native), AGENTS.md, docs/ARCHITECTURE.md, docs/MODULE_GUIDE.md,
docs/TESTING.md untuk KONSEP/PRINSIP/ALUR (JANGAN tiru kode mentah).

Target: {PATH_TARGET} (PHP 8.3+ kosong, Composer sudah di-init, deps sudah dipasang).
Buat bootstrap SETARA pakai IDIOM NATIVE PHP. Nama app baku: PHPAdmin.

BACA DULU dan PAHAMI perbedaan fundamental PHP Native vs port lain (di PORTING_GUIDE tabel 3.10):
TIDAK ada auto-escape di template .php (WAJIB helper e() di semua output konten user);
TIDAK ada named routes bawaan (wajib bangun RouteRegistry manual untuk RBAC route-driven);
TIDAK ada middleware pipeline bawaan (bangun MiddlewarePipeline PSR-15);
method-override: baca _method dari $_POST/$_GET di front controller SEBELUM dispatch;
session = PHP built-in + Redis handler; template = file .php (pisahkan dari logic);
front controller public/index.php = satu-satunya pintu web (Nginx try_files → index.php).

Pemetaan:
- Versi target        → PHP 8.3+, Composer 2.x, PSR-4/PSR-7/PSR-11/PSR-15; gunakan fitur PHP 8 idiomatik (match, named args, readonly, enum, #[Attribute])
- Modular per fitur   → namespace src/Modules/{Modul}/ (PSR-4) + class {Modul}Module::register(RouteRegistry $r): void daftarkan route modul; load semua modul dari config/modules.php
- DI                  → PHP-DI (php-di/php-di): ContainerBuilder + definitions.php (autowire + bind IUserService::class => autowire(UserService::class)); inject via constructor; $container->get(IUserService::class)
- Service + Interface → interface IUserService + class UserService implements IUserService; bind di definitions.php; controller terima via constructor injection (Dependency Inversion)
- Controller tipis    → class UserController: method per aksi (index/create/store/edit/update/destroy); terima service via konstruktor; delegate ke service; panggil render()/redirect() helper; JANGAN logic bisnis di controller
- Validator           → Respect/Validation per-field + collect errors ke map ['field' => 'pesan']; DTO = PHP 8 readonly class CreateUserDto { public function __construct(...) {} } — cast + whitelist eksplisit dari $_POST (anti mass-assignment: JANGAN langsung $_POST ke model)
- Error terpusat      → custom AppException + set_exception_handler() di front controller: petakan ke HTTP (web→flash+redirect, API→JSON); JANGAN die()/exit() di controller/service
- Named routes (WAJIB bangun manual) → RouteRegistry singleton: register(name, method, path); {Modul}Module::register() isi saat boot; url(name, params) untuk reverse-lookup URL; RBAC middleware reverse-lookup (method, path)→name→HasAccess; cocokkan name AND method; scan ke permission DB saat halaman Permission dibuka; Administrator bypass
- RBAC route-driven   → AuthorizeMiddleware dalam pipeline: authenticated → authorize; permission=(nama-route, method, guard); sidebar gating $currentUser->hasAccess($name, 'GET')
- Migration           → Phinx (robmorgan/phinx): phinx.php config + db/migrations/*.php (PHP class portabel, bukan SQL vendor); $table->addColumn('name','string',['limit'=>50]); ./vendor/bin/phinx migrate; auto-run saat dev APP_ENV=development
- ORM                 → Eloquent standalone (illuminate/database): Capsule::addConnection([...]) saat boot; class User extends Model { protected $table='users'; public $timestamps=true; } PIN $table eksplisit; many-to-many: belongsToMany(Role::class,'users_roles','user_id','role_id') PIN nama tabel+kolom
- View + theme switcher → template PHP native .php di src/views/: include layouts/admin_head.php + partial; helper e() WAJIB semua output konten user; theme switcher: inject $theme (palet DB) ke tiap render → CSS vars di admin_head.php (<style>:root{--primary:<?= e($theme['primary']) ?>}</style>); Content-Type: text/html set di helper render()
- env                 → vlucas/phpdotenv: load .env di public/index.php sebelum semua; readonly class AppConfig($_ENV); secret kosong di prod → throw new RuntimeException('JWT_SECRET wajib diisi')
- Session (web)       → PHP built-in session_start() + custom SessionHandlerInterface impl via Predis (Redis): session_set_save_handler(new RedisSessionHandler($predis)) SEBELUM session_start(); JANGAN filesystem session di produksi; cookie: httponly=true, samesite=Lax, secure=true (prod)
- JWT (API)           → firebase/php-jwt: JWT::encode($payload,$secret,'HS256') / JWT::decode(); blacklist via Redis (setex "blacklist:{jti}" $ttl "1") saat logout; verifikasi: decode + cek blacklist
- Password/OTP        → PHP built-in password_hash($pwd, PASSWORD_BCRYPT, ['cost'=>$rounds]) + password_verify(); OTP via random_bytes(3)→bin2hex()→password_hash simpan+expiry time()+600; rate-limit Redis INCR/EXPIRE
- Rate limit          → custom RateLimitMiddleware: Redis INCR "ratelimit:{ip}:{endpoint}" + EXPIRE; daftarkan di route sensitif (login/register/reset)
- Security headers    → custom SecurityHeadersMiddleware: set X-Frame-Options, X-Content-Type-Options:nosniff, HSTS, Referrer-Policy; CORS: header manual untuk API; nosniff WAJIB agar text/html tidak di-sniff ulang
- CSRF               → custom CsrfMiddleware: generate token bin2hex(random_bytes(32)) → simpan session; inject $csrf ke semua view context; validasi $_POST['_csrf'] atau $_GET['_csrf'] pada POST/PUT/PATCH/DELETE; multipart form: _csrf boleh di $_POST (PHP parse body multipart untuk semua method asli POST); form delete (method-override): _csrf di $_GET konsisten dengan port lain
- Method-override     → front controller public/index.php: $method = strtoupper($_POST['_method'] ?? $_GET['_method'] ?? $_SERVER['REQUEST_METHOD']); override hanya jika request asli POST; pakai $method untuk dispatch ke router; form delete: action="…/delete?_method=DELETE"
- Flash+validasi inline → $_SESSION['flash'] = ['errors'=>[...],'old'=>[...]] setelah validasi gagal → redirect (PRG) → baca+clear di middleware awal request berikutnya → inject ke view context; template: <?= isset($errors['name']) ? 'is-invalid' : '' ?> + <?= e($old['name'] ?? $user->name ?? '') ?>
- Kompresi/static    → static files (CSS/JS/img) dilayani langsung Nginx/Apache (BUKAN lewat PHP) + Cache-Control di config Nginx; PHP handle route dinamis saja; ob_start('ob_gzhandler') atau zlib.output_compression di php.ini untuk response PHP
- File storage        → AWS SDK PHP v3 (aws/aws-sdk-php): new S3Client([...]) + createPresignedRequest(); validasi magic-byte: (new \finfo(FILEINFO_MIME_TYPE))->buffer(fread($file,16)) → whitelist; re-encode via GD (imagecreatefromjpeg → imagejpeg) atau Intervention Image
- Email (SMTP)        → PHPMailer: konfigurasi SMTP dari env; template email HTML dari src/views/mail/*.php (render via ob_start()/ob_get_clean())
- Graceful shutdown   → PHP FPM: SIGTERM ditangani FPM; register_shutdown_function() untuk cleanup (tutup koneksi DB/Redis)
- Listen error fail-fast → tangkap Exception saat init DB/Redis di front controller: error_log($e->getMessage()); http_response_code(500); exit(1)
- Path aset/template  → define('APP_ROOT', dirname(__DIR__)) di front controller; semua path via APP_ROOT.'/src/views/...'; storage: APP_ROOT.'/storage/...'; JANGAN __DIR__ relatif di dalam src/
- Test               → PHPUnit: unit (service), integration (repository↔DB SQLite in-memory: illuminate/database driver sqlite :memory:), HTTP (Guzzle atau custom test client); PHPUnit test runner di CI
- BDD                → Behat (behat/behat): .feature files + FeatureContext.php step definitions Bahasa Indonesia/English
- Convention checker  → PHPStan level 8 + custom rule (service tanpa interface=error; controller akses DB langsung=error; $_ENV/getenv() di src/Modules/=error); PHP_CodeSniffer PSR-12; Composer script "check": ["./vendor/bin/phpstan analyse","./vendor/bin/phpcs"] → CI gate
- UI admin (replika 1:1) → tiru PERSIS chrome/layout+menu+SEMUA halaman+tabel index NodeAdmin (Manifest file + Struktur tabel kanonik: thead 2-baris filter+header, select-all, page-size, Delete Selected, filter per-kolom q_*, Status=ikon, role/method=badge, action dropdown, pagination jaga-filter); jQuery di chrome (dep Trumbowyg + select-all #checkall), Rich Text Editor Trumbowyg + FILE MANAGER (modul media: GET/POST /admin/v1/media/list|upload|delete → simpan ke folder editor/ storage, validasi magic-byte, CSRF via header; plugin filemanager.js modal upload/list/hapus+sisip <img>), Frontend Template switcher DI-FOLD ke Setting (bukan menu terpisah), landing fe/default = halaman RICH multi-seksi + aset css/style.css+js/motion.js (bukan placeholder), input file .form-control POLOS (tombol native—JANGAN style ::file-selector-button custom)+preview gambar SELALU dirender (<img> tanpa guard if; src kosong/rusak → fallback gambar GLOBAL di foot: listener error + cek naturalWidth===0 → ganti img gagal dgn placeholder ikon fa-image/fa-user, JANGAN biarkan slot kosong); deskripsi Setting pakai trumbowyg-editor (rich editor+file manager) → HTML disanitasi server saat simpan (HTML Purifier atau strip_tags whitelist) + dirender MENTAH (echo $safeHtml) di landing; login Keep-me-logged-in+Forgot+register
- DB schema lintas-port (BYTE-IDENTIK) → Eloquent PIN protected $table='users' eksplisit tiap model; PIN join table: belongsToMany(Role::class,'users_roles','user_id','role_id') — nama tabel+kolom eksplisit; Phinx migration PIN nama tabel+kolom (jangan auto-naming); id = varchar(36) UUID (UUID via ramsey/uuid atau bin2hex(random_bytes(16))); status varchar (bukan ENUM — Phinx 'string' 20 char); guard_name varchar(20) def 'web'; kolom desc (Phinx: addColumn('desc','string',[...]) aman, Phinx auto-quote; raw SQL: quote per-dialek); audit created_by/updated_by; permissions.name NON-unik
- /make-module        → PHP CLI script bin/make_module: generate src/Modules/{Modul}/ + {Modul}Controller.php/{Modul}Service.php/I{Modul}Service.php/{Modul}Repository.php/{Modul}Module.php dari template heredoc; tambah entry ke config/modules.php; composer dump-autoload
- Varian Full vs API-only → env APP_MODE=full|api di front controller: mode api = skip session_start(), CsrfMiddleware, template render, route web; mode full = mount semua; {Modul}Module::register() cek $config->appMode sebelum daftarkan route web. Upgrade: ./bin/add_ui (salin file view yang absent + set APP_MODE=full + composer dump-autoload + run tests)

CATATAN KHUSUS PHP NATIVE (WAJIB DITERAPKAN):
- e() helper global WAJIB di semua <?= ?> output konten user: function e(?string $v): string { return htmlspecialchars((string)$v, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); } — definisikan di src/Core/helpers.php (autoloaded via composer.json "files")
- Front controller = satu pintu: public/index.php saja yang diakses web; Nginx: try_files $uri /index.php; file PHP lain di src/ tidak boleh diakses langsung
- session_start() sebelum output: pastikan tidak ada whitespace/output sebelum session_start(); gunakan ob_start() di awal front controller sebagai buffer
- Eloquent PIN $table: protected $table = 'users' eksplisit (jangan auto-pluralize); many-to-many PIN semua parameter belongsToMany()
- OPcache produksi: opcache.enable=1, opcache.validate_timestamps=0; dev: validate_timestamps=1
- Content-Type JSON API: header('Content-Type: application/json') sebelum echo json_encode(...); jangan biarkan default text/html untuk API response

Pertahankan SEMUA prinsip Bagian 1 PORTING_GUIDE + penuhi SELURUH Capability Checklist.
WAJIB hasilkan AGENTS.md versi PHP Native, convention checker (PHPStan+PHPCS) + CI,
script bin/make_module generator, varian Full/API-only (APP_MODE) + bin/add_ui,
modul percontohan User/Role/Permission lengkap, halaman showcase komponen UI + docs/UI_COMPONENTS.md.
Kerjakan BERTAHAP (fondasi → modul percontohan → guardrail → sisanya), verifikasi tiap fase
(composer test + composer check hijau).
```

---

## Tips

- **Path absolut**: ganti `{PATH_NODEADMIN}` & `{PATH_TARGET}` dengan path nyata (mis. `/home/mulyawan/Project/Admin/NodeAdmin`).
- **Akses dua folder**: pastikan AI bisa membaca folder NodeAdmin (referensi) sekaligus menulis di folder target.
- **Jangan one-shot**: kalau AI langsung menulis semua, minta "rencanakan fase dulu, kerjakan fase 1 saja, lalu lapor".
- **Verifikasi tiap fase**: build + test + checker harus hijau sebelum lanjut.
- **Idiom > kemiripan**: kode harus terasa ditulis developer framework itu, bukan porting JS.
