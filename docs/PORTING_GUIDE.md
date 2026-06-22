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
- [ ] **Auth ganda**: sesi (web, store di Redis/cache) + **JWT** (API), algoritma di-pin (HS256), blacklist token saat logout (TTL = sisa masa berlaku). **Uji blacklist secara nyata** (login→akses 200→logout→akses **401**) dengan store yang **berperilaku seperti runtime** — bukan mock yang selalu mulus. Pelajaran NodeAdmin: client Redis mode-legacy membuat `set/get` jadi callback-style; kode yang memakai gaya Promise gagal **senyap** (token tetap valid setelah logout) namun **lolos** test karena mock-nya flat-Promise. Pastikan API store yang dipakai = API yang diuji.
- [ ] **RBAC ROUTE-DRIVEN** (WAJIB — bukan subject-based): permission = **(nama-route, method, guard)**, mis. `{name:"admin.v1.access.user.delete", method:"DELETE", guard:"web"}` — BUKAN subjek seperti `user.delete`. Permission **di-scan OTOMATIS dari registry named-route** (padanan NodeAdmin `getAllRegisteredRoute`): tiap route bernama → satu permission; guard dari prefix nama (`api.`→`api`, lainnya→`web`). Sinkron **lazy saat buka halaman Permission** + sekali setelah route terdaftar (boot). JANGAN pakai daftar permission hardcoded. Middleware **authorize TANPA argumen** — turunkan `(nama, method)` dari request berjalan (`method` + pola-path → reverse-lookup ke nama route) lalu cek `HasAccess(name, method)`. Urutan **authenticated → authorize**; Administrator **bypass**. Cocokkan **name AND method** (jadi GET vs DELETE pada path sama = izin berbeda). Sidebar gating via `hasAccess(currentUser, "nama.route", "GET")`.
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
- [ ] **Bind/listen error fail-fast** — tangani error saat server mulai listen (mis. **port sudah dipakai**/EADDRINUSE): cetak pesan jelas + exit non-zero, **jangan** biarkan jadi unhandled error yang mematikan proses senyap. Di runtime async (mis. Node), event `error` server tak tertangkap `try/catch` di sekitar `listen` — pasang handler `error` eksplisit.
- [ ] **Dev hot-reload jangan restart karena data runtime** — bila app menulis cache/unduhan ke direktori dalam project (mis. cache katalog, file ter-download), **kecualikan direktori itu dari watcher** dev (nodemon/`--watch`/setara), dan batasi watch ke folder sumber. Jika tidak: tiap penulisan cache memicu **restart di tengah request** → tampak sebagai "app mati senyap" / request gagal saat pemakaian pertama (sebelum cache terbentuk).
- [ ] **Stateless** (session & file di store eksternal) → siap horizontal scaling.
- [ ] **Varian aplikasi: Full (UI + API) vs API-only**, dipilih **runtime via env** (mis. `APP_MODE=full|api`) dari **satu basis kode** — bukan dua project terpisah. Mode `api` melewati lapisan web (session/static/layout/route web), hanya REST + JWT (stateless); mode `full` memasang semuanya. **Diff antar-varian WAJIB purely-additive**: file shared identik di kedua mode (cabang lewat env/guard runtime, bukan meng-edit isi file saat build varian), modul UI didaftarkan dengan **guard kehadiran** (absent → lewati diam-diam) sehingga API-only = Full **dikurangi file UI utuh**. Konsekuensinya install API-only bisa **di-upgrade ke Full kapan saja** (tambah file UI yang absent + set `APP_MODE=full`) tanpa scaffold ulang & tanpa konflik — sediakan **command upgrade idempotent** (mis. `add-ui` setara) yang menyalin hanya file absent, merge deps/scripts UI, lalu **verifikasi (checker + typecheck + test)**.
- [ ] **Named routes (method-aware)** — daftarkan tiap route **bernama + dengan method**, nama PERSIS NodeAdmin (`{admin.v1|web|api.v1}.{modul}.{resource}.{aksi}`, resource access namespace `access`+singular), SEMUA aksi lengkap (index/create/store/edit/update/delete/delete_selected). Lihat "Named routes admin + METHOD".
- [ ] **Method-override (PUT update + DELETE delete)** — update = **PUT** lewat `action=".../update?_method=PUT"` & delete = **DELETE** lewat form `action=".../delete?_method=DELETE"` + wrapper yang ubah method SEBELUM routing (Gin: bungkus engine di `http.Server`, BUKAN middleware grup). delete = **form POST+`?_method=DELETE`** dgn `<button data-confirm>` (BUKAN `<a href>` GET) + sertakan CSRF token (DELETE = unsafe method).
- [ ] **Flash + validasi inline** — feedback sukses/error setelah redirect (PRG pattern). Saat validasi gagal: **error per-field INLINE** (`class="… is-invalid"` + `<div class="invalid-feedback">pesan</div>`, padanan helper `getError(field)`) **dan `old input`** mengisi ulang form (jangan kehilangan isian). Mekanisme: simpan `errors`(map field→pesan) + `old`(map field→nilai) di sesi **satu-redirect** lalu ekspos ke view (di Go: `middleware.SetFieldErrors` + Flash → locals `errors`/`old`, template `{{if index .errors "x"}}`/`{{or (index .old "x") .setting.X}}`). JANGAN cukup flash generik tanpa penanda per-field.
- [ ] **Bebas API & dependency usang** — jangan pakai API yang sudah deprecated/akan hilang di versi mayor framework berikutnya (pelajaran NodeAdmin: `res.redirect('back')` magic-string dihapus di Express 5 → pakai `req.get('Referrer') || '/'`), dan hindari dependency tak-terawat yang memicu deprecation runtime (mis. lib lama memanggil API deprecated) — ganti dengan helper inline kecil bila perlu. Jadikan output bebas-deprecation sebagai target rilis.

#### 🗄️ Database (portabel — bukan cuma ORM)
- [ ] **Multi-database** via env (lihat "Kriteria ORM & Migration" di bawah).
- [ ] **Migration kode portabel** (bukan SQL vendor).
- [ ] **Tipe kolom abstrak**, tanpa collation hardcoded, tanpa raw query vendor, tanpa `LIKE` manual (case-sensitivity beda) → pakai helper case-insensitive.

#### 🎨 Fitur Fungsional
- [ ] **Theme switcher (admin)** — palet tema disimpan di DB, ganti tanpa rebuild (CSS variable), beberapa pilihan warna.
- [ ] **Frontend template switcher (landing)** — katalog desain landing dari sumber eksternal (mis. repo opentailwind). WAJIB:
  - **Daftar di server, sekali**: ambil katalog dari sumber (API/manifest) → cache (memori TTL + persist disk/cache store); **fallback** ke katalog kurasi statis bila sumber offline. Jangan fetch tiap request.
  - **Paginasi + search server-side** atas katalog (filter nama + kategori, **12 item/halaman**), bukan kirim seluruh daftar ke klien; **item aktif disematkan ke halaman pertama**. **Pagination WINDOWED** (640 ≈ 54 halaman): Previous · `1` · `…` · `cur-2..cur+2` · `…` · `last` · Next — JANGAN render semua nomor halaman.
  - **Thumbnail ringan + preview penuh (TEKNIK PRESISI)**: thumbnail = **iframe `srcdoc`** diisi HTML yang **di-fetch klien** lalu di-cache (localStorage per-slug) — **BUKAN `<iframe src="/preview/{slug}">` langsung** (itu memicu navigasi penuh + fetch server tiap kartu → thumbnail GAGAL untuk katalog besar). Iframe **di-scale** (`transform:scale(cardWidth/1280)`) agar tampak screenshot; **lazy-load via IntersectionObserver** (hanya yang terlihat). Klik thumbnail → **modal preview** (srcdoc HTML penuh). **`forceLight()`**: inject `<meta color-scheme:light>` + override `@custom-variant dark` agar preview template (opentailwind pakai `dark:` mengikuti `prefers-color-scheme`) **tak ikut gelap** saat admin dark-mode. Server hanya proxy sekali per item (lalu cache klien).
  - **Proxy preview tahan-banting (server-side)**: saat server mem-fetch HTML item dari sumber, **(a)** sajikan dari cache lokal lebih dulu bila ada (instan, tak bergantung jaringan/rate-limit), **(b)** beri **timeout** pada fetch upstream agar request tak menggantung (timeout fetch katalog/tree boleh lebih longgar dari fetch 1 file), **(c)** bila upstream gagal namun cache lokal ada → fallback ke lokal; baru error bila benar-benar tak ada sumber. Tanpa ini, blip jaringan/proxy-timeout muncul sebagai "gagal memuat preview" di klien.
  - **Anti-SSRF**: hanya item yang ada di katalog (atau cocok pola slug ketat) yang boleh di-fetch/proxy; validasi sebelum unduh. Pola slug opentailwind: `^([a-z]+(?:-[a-z]+)*)-(\d{3})-([a-z0-9-]+)$` (`{kategori}-{NNN}-{nama}`); derive metadata (name/kategori) dari slug.
  - **Model render PRESISI** (jangan dibuat-buat): **SATU template default = slug opentailwind nyata `agency-consulting-002-creative-agency`** (bukan slug generik "default"/"minimal"), dirender lewat **view native kaya** (NodeAdmin EJS `fe/default`; port lain: view native ekuivalen). **SEMUA template lain (≈640)** = HTML mentah **diunduh on-demand** dari `RawBaseURL/{slug}.html` lalu di-cache & disajikan apa adanya. Default ada di katalog & jadi `setting.fe_template` awal. Sumber katalog = GitHub tree API opentailwind (640), di-cache (memo 6 jam + disk `_catalog.json`). JANGAN menambah template "builtin" karangan sendiri — itu menyimpang dari NodeAdmin.
  - **Unduh on-demand + cache lokal** saat item dipilih & disimpan (template aktif disajikan dari cache; app tetap ramping — hanya 1 default ter-bundle agar jalan offline).
  - **Pemilihan via form Setting utama** (BUKAN endpoint apply terpisah): klik kartu **PILIH/TERPILIH** → set **hidden input `fe_template`** (+ persist localStorage agar tak hilang saat ganti halaman katalog); slug ter-submit bersama **Save** form Setting → server simpan + **unduh (Ensure) saat Save**. Search katalog = form GET terpisah (`form="fe_search"`) agar tak men-submit form POST utama.
- [ ] **Landing publik data-driven (sample)** — template default **`fe/default` = halaman RICH multi-seksi PERSIS NodeAdmin** (hero, stats, services, client logos, feature cards, masonry gallery, about bento, testimonial, CTA, footer), bukan placeholder. Punya **layout terpisah** (head/header/footer) + **aset sendiri** (`public/fe/default/css/style.css` + `js/motion.js`, animasi via motion.js + Tailwind v4 browser CDN + font Inter). Mengikat data Setting (nama→heading, logo, deskripsi, kontak email/telp/alamat dgn guard, copyright). Template katalog lain = HTML statis self-contained (preview desain).
- [ ] **Routing home publik** — root `/` **me-render halaman home LANGSUNG** (bukan redirect; URL tetap bersih di root), `/home` = alias eksplisit yang dapat di-link. Login **tidak lagi di root**; halaman login eksplisit di `/auth/login`. Catatan port: daftarkan route `/` **di modul home** (setelah middleware layout/template aktif), **bukan** sebagai root-handler inti — agar layout publik penuh ikut ter-render.
- [ ] **Multi-timezone** — tampilan tanggal mengikuti timezone user.
- [ ] **File storage eksternal** (S3/OSS/setara) dengan signed URL.
- [ ] **Email** (reset OTP, notifikasi) via SMTP konfigurable.
- [ ] **UI server-side** (template engine native + Tailwind): layout/partial (head/sidebar/topbar/foot), tabel + search + pagination, form CRUD, status pakai ikon, fallback gambar gagal-load. **→ struktur, penamaan menu, named-route & komponen WAJIB persis: lihat ["Standar UI Admin & Struktur Menu"](#standar-ui-admin--struktur-menu-wajib-direplikasi-11).**
- [ ] **Sidebar dinamis** — item menu tampil sesuai permission user (`hasAccess`), penanda menu aktif, dengan label/urutan/ikon **sesuai tabel menu** di "Standar UI Admin".
- [ ] **Halaman showcase komponen UI** (`/admin/v1/components` setara) — acuan hidup elemen: stat card+counter, chart (themeable), badge/status, alert, button+dropdown, form, tabel+pagination.
- [ ] Modul inti: **User, Role, Permission (RBAC), Profile, Setting, Dashboard (stats), Components (showcase), Home (frontend template + halaman publik)**.

#### 🧪 Testing (wajib tiap fitur)
- [ ] **Unit** (helper murni), **Integration** (service↔DB, SQLite in-memory), **API** (HTTP), **Security** (RBAC/CSRF/rate-limit/JWT/mass-assign), **Smoke**, **E2E** (browser), **BDD** (skenario).
- [ ] **CI**: lint/checker + test + audit + matrix DB (MySQL/Postgres) tiap push/PR. (E2E dijalankan lokal — lambat/rapuh di CI, non-blocking → tak bernilai sebagai gate.)
- [ ] **Mock setia-perilaku (fidelity)** — saat memalsukan dependency eksternal (Redis/cache/storage/HTTP), tiru **API & perilaku yang sama persis** dengan runtime (signature, nilai balik, sync vs async). Mock yang "selalu mulus" menyembunyikan bug nyata (pelajaran NodeAdmin: blacklist JWT lolos test tapi gagal di produksi karena mock Redis flat-Promise, sedangkan client asli mode-legacy callback-style). Untuk jalur kritis (auth/blacklist), tambah **test integrasi terhadap store nyata** atau verifikasi runtime, jangan hanya mock.
- [ ] **Test resilience/fallback yang memicu error = assertion, bukan kebisingan** — saat menguji jalur gagal (upstream down → fallback), error log yang muncul itu **diharapkan**: spy/redam logger di test itu + **assert** ia terpanggil, agar output bersih dan intent jelas (bukan tampak seperti kegagalan).

#### 🛡️ Guardrail (jaga konsistensi pengembangan AI)
- [ ] **Dokumen aturan** (AGENTS.md setara) + mirror untuk tiap AI tool.
- [ ] **Convention checker** (gate CI) — menolak penyimpangan pola/prinsip + cek kelengkapan kontekstual (entity→migration, input→validator, ada→test, dll).
- [ ] **Generator modul** (`/make-module` setara) + **MODULE_GUIDE** template.
- [ ] **Aturan AI**: sajikan rencana artefak + tanya bila ambigu sebelum coding; verifikasi (checker+typecheck+test) sampai hijau.

#### 📚 Dokumentasi
- [ ] README (fitur, instalasi, env, multi-DB, testing, deployment), ARCHITECTURE, MODULE_GUIDE, TESTING, API (daftar endpoint), **UI_COMPONENTS (katalog snippet komponen)**.
- [ ] `.gitignore` mengecualikan artefak generated (log, coverage, build).

---

### Standar UI Admin & Struktur Menu (WAJIB direplikasi 1:1)

Hasil porting harus **tampak & terstruktur identik** dengan admin NodeAdmin — JANGAN mengarang penamaan/urutan menu, named-route, atau gaya UI sendiri. **Sumber kebenaran**: `src/resources/layouts/be/default/*.ejs` + `src/modules/*/views/be/default/`.

> ⚠️ **ANTI-PATTERN YANG SUDAH TERJADI (jangan ulangi di bahasa mana pun).** Saat porting ke Go, UI admin sempat dibuat **versi sendiri** (chrome/menu/tema yang "mirip" tapi beda: nama menu diterjemahkan, struktur sidebar/topbar beda, tema tak terpasang ke chrome, tabel pakai markup sendiri). Akar masalah: mengandalkan "test hijau" sebagai bukti selesai, padahal UI tak punya gate otomatis. **ATURAN:** replikasi **per-view** dari sumber NodeAdmin (`be/default`), bukan dari ingatan/imajinasi; bandingkan hasil render berdampingan; centang **setiap** view di daftar di bawah. UI yang "kira-kira sama" = BELUM selesai.

**Framework (PENTING):** admin NodeAdmin memakai **Tailwind (CDN, Preflight aktif), themeable** — **BUKAN** framework Bootstrap. Tampilannya bergaya admin klasik (eks-SB-Admin-2) dan markup memakai **nama-kelas gaya Bootstrap** (`.btn`, `.form-control`, `.table`, `.row`, `.d-flex`, `.dropdown`, `.badge`, …) yang **di-reimplementasi dengan Tailwind `@apply`** (lihat `head.ejs`). Aset lama `public/be/default/css/sb-admin-2.min.css` + vendor bootstrap **TIDAK lagi dimuat** (legacy) — jangan dipakai. Port WAJIB memakai pendekatan Tailwind yang sama (atau template engine native + Tailwind), bukan menarik Bootstrap.

#### CSS / komponen (reimplementasi via Tailwind, lihat `head.ejs`)
- **Tema aktif** (template switcher) mendorong warna `primary/secondary/theme-light/theme-dark` → Tailwind config + CSS vars (`--primary` dst). Body ber-gradient.
- Sediakan kelas: `.btn .btn-sm .btn-primary .btn-success .btn-danger .btn-group`, `.form-control .form-label .form-check-input .invalid-feedback .is-invalid`, `.table .table-bordered .table-hover`, `.alert .alert-{danger,success,info,warning,primary}`, `.badge .text-bg-primary`, `.pagination .page-item .page-link`, `.dropdown .dropdown-toggle .dropdown-menu .dropdown-item .dropdown-divider`, `.tw-card`, `.nav-link-tw(.active)`, `.sidebar-gradient`, + shim (`.row .d-flex .align-items-center .me-2 …`).
- Komponen JS **vanilla themeable**: Modal, Toast, Confirm, Dropdown (tanpa Bootstrap JS).
- Ikon: **FontAwesome** (`fas …`) + **Bootstrap Icons** (`bi …`). Plugin: jQuery + select2 + Trumbowyg (rich-text deskripsi) + Chart.js (grafik dashboard).

#### Tema admin — switchable, palet PERSIS (DB-driven, tanpa rebuild)
Satu set view didorong oleh **4 warna** (`primary/secondary/light/dark`) per tema via CSS vars + `tailwind.config` inline (di `head`). Tema aktif = `Setting.theme`; switcher di halaman **Setting** menampilkan seluruh palet (radio/preview). Default **Blue**. Palet **WAJIB SAMA** (sumber: `@flazhost-nodeadmin/core` `THEMES`):

| Tema | primary | secondary | light | dark |
|------|---------|-----------|-------|------|
| **Blue** *(default)* | `#3B82F6` | `#60A5FA` | `#DBEAFE` | `#1E40AF` |
| Black | `#374151` | `#4B5563` | `#6B7280` | `#1F2937` |
| Brown | `#A16207` | `#D97706` | `#FEF3C7` | `#78350F` |
| Green | `#10B981` | `#34D399` | `#D1FAE5` | `#047857` |
| Grey | `#6B7280` | `#9CA3AF` | `#E5E7EB` | `#374151` |
| Orange | `#F59E0B` | `#FBBF24` | `#FEF3C7` | `#D97706` |
| Purple | `#8B5CF6` | `#A78BFA` | `#F3E8FF` | `#6D28D9` |
| Red | `#EF4444` | `#F87171` | `#FECACA` | `#B91C1C` |
| Yellow | `#F59E0B` | `#FCD34D` | `#FEF3C7` | `#D97706` |

Tiap render admin meng-inject locals: `theme` (palet aktif), `themeName`, `themes` (semua palet → switcher), `setting`. Pemetaan: `--primary/--secondary/--theme-light/--theme-dark` + Tailwind colors `primary/secondary/theme-light/theme-dark`. Sidebar `.sidebar-gradient`=`--theme-dark`; nav aktif & `.btn-primary`=`--primary`; body gradient=`--theme-light`.

#### Layout chrome (`layouts/be/default/`)
`main = head + sidebar + (topbar + body) + foot`. Konten offset `md:ml-64`.
- **Sidebar** (fixed kiri, `w-64`, `.sidebar-gradient`, mobile slide-in + overlay): brand (logo Setting / ikon `fa-chart-line` + nama app) → nav → footer copyright.
- **Topbar** (`.tw-card`, sticky): hamburger (mobile) + ikon home; **user dropdown** (avatar + "Welcome, {nama}" + ikon gear) → **Profile** / **Logout** (form POST tersembunyi).
- **Flash → Toast** global di setiap halaman admin.

#### Menu sidebar — urutan, label, ikon, route, guard (WAJIB PERSIS)
| # | Label | Ikon | Named route | Guard `hasAccess(…,'GET')` |
|---|-------|------|-------------|----------------------------|
| 1 | Dashboard | `fas fa-tachometer-alt` | `admin.v1.dashboard.index` | — |
| 2 | UI Components | `fas fa-cubes` | `admin.v1.components.index` | `admin.v1.components.index` |
| — | **Maintenance** *(header seksi; tampil bila salah satu item di bawah lolos)* | | | |
| 3 | Permission | `fas fa-key` | `admin.v1.access.permission.index` | `…permission.index` |
| 4 | Role | `fas fa-user-shield` | `admin.v1.access.role.index` | `…role.index` |
| 5 | User | `fas fa-users` | `admin.v1.access.user.index` | `…user.index` |
| 6 | Setting | `fas fa-cog` | `admin.v1.setting.index` | `…setting.index` |

Dropdown topbar: **Profile** → `admin.v1.profile.index`, **Logout** → `web.auth.logout` (**POST** via form tersembunyi + CSRF, BUKAN link GET).
Label menu **singular, Bahasa Inggris** (Permission/Role/User/Setting) — JANGAN diubah/diterjemahkan.

#### Named routes admin + METHOD (samakan PERSIS — nama, path, DAN method)
Pola nama: `{admin.v1|web|api.v1}.{modul}.{resource}.{aksi}`. Tiap route didaftarkan **bernama + dengan method-nya** (registry method-aware). Resource access pakai **namespace `access` + singular** (`user`/`role`/`permission`, BUKAN jamak).

**CRUD per resource access** (web `/admin/v1/access/{resource}`, API `/api/v1/access/{resource}`):

| Aksi | Method | Path (web) | Nama |
|---|---|---|---|
| index | GET | `/admin/v1/access/user` | `admin.v1.access.user.index` |
| create | GET | `/admin/v1/access/user/create` | `…user.create` |
| store | POST | `/admin/v1/access/user/store` | `…user.store` |
| edit | GET | `/admin/v1/access/user/:id/edit` | `…user.edit` |
| update | **PUT** | `/admin/v1/access/user/:id/update` | `…user.update` |
| delete | **DELETE** | `/admin/v1/access/user/:id/delete` | `…user.delete` |
| delete_selected | POST | `/admin/v1/access/user/delete_selected` | `…user.delete_selected` |

**Kelola permission per-role (modul Role — WAJIB, halaman terpisah, BUKAN cuma `permission_ids[]` di form edit):** dropdown aksi Role memuat item **Permission** (`fa-key`) → halaman assign/unassign. 5 route:
| Aksi | Method | Path | Nama |
|---|---|---|---|
| list | GET | `/admin/v1/access/role/:id/permission` | `admin.v1.access.role.permission` |
| assign (1) | GET | `/admin/v1/access/role/:id/permission/:permission_id/assign` | `…role.permission.assign` |
| assign bulk | POST | `/admin/v1/access/role/:id/permission/assign_selected` | `…role.permission.assign_selected` |
| unassign (1) | GET | `/admin/v1/access/role/:id/permission/:permission_id/unassign` | `…role.permission.unassign` |
| unassign bulk | POST | `/admin/v1/access/role/:id/permission/unassign_selected` | `…role.permission.unassign_selected` |

Halaman = tabel SEMUA permission (paginated + filter `q_name`/`q_status`/`q_desc`) dengan kolom **Status = ikon assigned/not** (filter `q_status`: Active=assigned, Inactive=belum, via subquery `roles_permissions`), action dropdown **Assign/Unassign**, + **Assign/Unassign Selected** (bulk, `selected[]`). View `roles/permission`. **Kembar di API**: 5 route `api.v1.access.role.permission{,.assign,.assign_selected,.unassign,.unassign_selected}` dgn path/method sama (single assign/unassign = GET, bulk = POST `{selected:[...]}`). (Verifikasi GoAdmin: `tests/bdd/delete_method_smoke_test.go` `TestRolePermissionManagement` + `TestApiRolePermission`.)

Lainnya: `admin.v1.dashboard.index` (GET) · `admin.v1.components.index` (GET) · `admin.v1.setting.index` (GET) / `admin.v1.setting.update` (**PUT** `/admin/v1/setting/update`) / `admin.v1.setting.fe_preview` (GET `/admin/v1/setting/fe-preview/:slug` — proxy pratinjau template FE; **namespace setting**, BUKAN modul "appearance" terpisah) · `admin.v1.profile.index` (GET) / `admin.v1.profile.update` (**PUT** `/admin/v1/profile/update`) · `web.auth.{login,login.post,register,register.post}` + `web.auth.logout` (**POST** `/auth/logout`, via form CSRF) + **reset OTP (publik)** `admin.v1.auth.reset.req` (GET `/admin/v1/auth/reset/req`, form minta OTP) / `admin.v1.auth.reset.request` (POST `…/reset/request`) / `admin.v1.auth.reset.proc` (GET `…/reset/proc`, form OTP+pwd) / `admin.v1.auth.reset.process` (POST `…/reset/process`) · `web.home.root`/`web.home.index`.

**Method-override + DELETE-delete (WAJIB ditiru):**
- **update = PUT** & **delete = DELETE** via form HTML (hanya GET/POST) → `<form method="POST" action=".../update?_method=PUT">` / `<form method="POST" action=".../delete?_method=DELETE">` + **middleware/wrapper method-override** yang membaca `?_method` SEBELUM routing (di Go/Gin: bungkus engine di level `http.Server`, bukan middleware grup — Gin me-routing by method lebih dulu). Override hanya untuk POST→{PUT,PATCH,DELETE}.
- **delete = DELETE** lewat **form** `<form method="post" action=".../delete?_method=DELETE">` berisi `<button data-confirm="…">` (BUKAN `<a href>` GET) → handler konfirmasi pada **submit form**. Form delete WAJIB menyertakan **CSRF token** (DELETE termasuk method unsafe).
  - **CSRF + DELETE — caveat per-bahasa**: NodeAdmin/Express mem-parse body form berdasarkan Content-Type (tak peduli method), jadi `_csrf` cukup di **hidden body field** (NodeAdmin meng-inject otomatis ke semua form non-GET). **Go `net/http` HANYA mem-parse body form untuk POST/PUT/PATCH — BUKAN DELETE**, sehingga setelah override→DELETE `c.PostForm("_csrf")` kosong. Karena itu di Go: (a) middleware CSRF baca token dari **body → query → header** (sejajar `req.body._csrf || req.query._csrf || header` NodeAdmin), dan (b) form delete menaruh token di **query**: `action=".../delete?_method=DELETE&_csrf={{$._csrf}}"`. Verifikasi nyata: lihat `tests/bdd/delete_method_smoke_test.go` (login → submit form DELETE → user benar-benar terhapus; kontrol negatif: POST tanpa `?_method` tak match route).
- Daftarkan SEMUA aksi (index..delete_selected) **lengkap dengan method-nya** di registry named-route.
- **API = SIMETRIS web, path VERBOSE (BUKAN REST).** Seluruh CRUD access API memakai path & nama PERSIS web (minus halaman `create` form): index `GET /api/v1/access/{resource}`, store `POST …/store`, edit `GET …/:id/edit`, update `PUT …/:id/update`, delete `DELETE …/:id/delete`, delete_selected `POST …/delete_selected` — nama `api.v1.access.{resource}.{aksi}`, kembar `admin.v1.access.{resource}.{aksi}`. **DILARANG gaya REST** `GET /:id` (show), `POST ``  (store), `PUT /:id` (update), `DELETE /:id` (destroy) — itu menyimpang dari NodeAdmin. Klien API (JWT) kirim method asli (PUT/DELETE) **tanpa** `?_method` override (override hanya untuk form web GET/POST). `delete_selected` body = `{ selected: [id,...] }`. Verifikasi: `tests/bdd/delete_method_smoke_test.go` (`TestApiVerbosePathsEndToEnd` + `TestApiDeleteMethodEndToEnd`: path verbose 200, path REST lama 404).

#### View per modul (`views/be/default/`)
- **index**: judul + tombol "Tambah" + tabel `.table` + search + `.pagination`.
- **create/edit**: form `.form-control`/`.form-label` + `.btn-primary`.
- **dashboard**: stat card `.tw-card` + chart (Chart.js, themeable).
- **auth**: login/register/reset — halaman terpisah, tetap themeable.
- **components**: showcase elemen (acuan hidup), **home (fe/default)**: landing publik (layout `fe` terpisah, juga Tailwind).

#### Daftar view yang WAJIB direplikasi (centang satu-per-satu vs sumber `be/default`)
Bukan cuma layout — **setiap halaman** harus dipadankan. Jangan anggap selesai bila salah satu masih markup buatan sendiri.

- [ ] **Layout chrome**: `head` (Tailwind config + tema + kelas komponen), `sidebar`, `topbar`, `foot` (Toast/Modal/Confirm/dropdown JS), `full-width` (varian tanpa sidebar bila ada).
- [ ] **Dashboard** (`dashboard/index`): stat-card + counter animasi, 2 chart (line+doughnut, warna ikut tema), recent activities, top products, **data table** (filter-row + select-all + bulk action + pagination).
- [ ] **UI Components** (`components/index`): 9 seksi (stat card, chart, badge/status, alert, button+dropdown, **popup Modal/Toast/Confirm**, form, rich-text, data table+pagination).
- [ ] **Setting** (`setting/index`): **Admin Theme** (swatch radio 4-warna + checked) + **Frontend Template** (katalog thumbnail iframe + preview modal + paginasi) + **Setting Form** (initial/name/description-richtext/icon/logo/login_image/phone/address/email/copyright + Save).
- [ ] **Profile** (`profile/profile`): form profil + avatar + ganti password.
- [ ] **Access**: `users/{index,create,edit}`, `roles/{index,create,edit,permission}` (halaman assign permission terpisah), `permission/{index,create,edit}` — semua pakai `.table .table-bordered .table-hover` + dropdown action + pagination.
- [ ] **Auth**: `login`, `register`, `reset_req`, `reset_proc` (themed) + `mail/otp` (template email HTML).

#### Komponen & form: detail yang sering terlewat (pelajaran nyata)
- **jQuery wajib di chrome head** — dependensi Trumbowyg **dan** select-all tabel (`$("#checkall")`). Pitfall nyata: chrome yang murni vanilla-JS bikin select-all **diam-diam mati** + Trumbowyg tak jalan. Muat jQuery sebelum plugin.
- **Rich text editor (Trumbowyg) + FILE MANAGER** di UI Components (seksi 8) + field deskripsi: `<textarea class="trumbowyg-editor form-control">`, init di `foot` (toolbar format/list/link/**filemanager**/fullscreen), **sinkron HTML editor → textarea saat submit**. **Tombol "File Manager"** (plugin `filemanager`) buka modal: **upload/list/hapus gambar** ke storage lalu sisip `<img>`. Butuh **modul `media`** dgn endpoint AJAX (sesi + CSRF via header): `GET /admin/v1/media/list`, `POST …/upload` (validasi magic-byte + re-encode, simpan ke sub-folder **`editor/`** storage → `{name,url,key}`), `POST …/delete` (key divalidasi anti path-traversal `editor/<nama-aman>`). Plugin JS (`vendor/trumbowyg/filemanager.js`) baca CSRF dari `<meta name="csrf-token">` → kirim header `x-csrf-token`. JANGAN cukup `insertImage` base64 — replika file manager NodeAdmin.
- **Frontend Template switcher DI-FOLD ke halaman Setting** (BUKAN menu terpisah, **BUKAN halaman/route/modul "appearance" terpisah**): kartu katalog (thumbnail iframe ter-scale + modal preview + cache-klien) + paginasi/search server-side ada DI halaman Setting; **pemilihan disimpan via form Setting utama** (hidden `fe_template` → `PUT /admin/v1/setting/update`, diunduh saat Save — **TANPA endpoint apply terpisah**). Pakai param sendiri (`fe_page`/`fe_search`/`fe_category`) agar tak bentrok form Setting. Proxy pratinjau = **`admin.v1.setting.fe_preview`** (`/admin/v1/setting/fe-preview/:slug`, namespace setting). **Anti-pattern (jangan diulang):** membuat modul/halaman `appearance` standalone dgn route `admin.v1.appearance.*` + tombol apply sendiri → menyimpang dari NodeAdmin (orphan, tak ada di sidebar).
- **Input file = `.form-control` POLOS (sama persis input lain)** — NodeAdmin TIDAK menata `::file-selector-button`/tombol-pemilih custom; cukup `class="form-control"` (kotak ber-border + padding) + tombol native browser apa adanya. **JANGAN over-style** tombol pemilih (justru bikin beda dgn NodeAdmin). Pastikan kelas `.form-control` IDENTIK di kedua app (border/rounded/padding/focus-ring).
- **Preview gambar field upload SELALU dirender** (di kiri input file): `<img src="{nilai}">` di-render **tanpa guard `if`** — saat nilai kosong/rusak, **bukan dibiarkan kosong** melainkan jatuh ke **placeholder**. Mekanisme: **fallback gambar GLOBAL** di `foot` (NodeAdmin `foot.ejs`) — listener `error` (capture) + cek `img.complete && naturalWidth===0` saat load → ganti `<img>` gagal/kosong dengan **kotak placeholder** (`<span>` abu-abu + ikon Font Awesome: `fa-user` bila avatar (class/alt mengandung user/picture/avatar/rounded-full), selain itu `fa-image`), ukuran mengikuti `width/height` gambar. Berlaku app-wide (setting icon/logo/login_image, profile/user avatar, logo sidebar/topbar). PITFALL nyata: men-guard `{{if .Picture}}<img>{{end}}` → slot kosong saat belum ada gambar (beda dgn NodeAdmin yang selalu tampil placeholder).
- **Rich editor di field rich-text lain**: bukan cuma showcase — **deskripsi Setting** (dan field rich lain) pakai `class="trumbowyg-editor form-control"` (editor + file manager). Konten HTML WAJIB **disanitasi di server saat simpan** (whitelist tag aman, buang `<script>`/`onerror`/`javascript:`; NodeAdmin `cleanRichText`/sanitize-html, Go `bluemonday`) lalu **dirender MENTAH** di tempat tampil (landing: `<%- %>` / `template.HTML`/`safeHTML`) — bukan escaped. Round-trip: textarea simpan HTML mentah; Trumbowyg baca via value (entity ter-decode otomatis di RCDATA).
- **Login** WAJIB punya: checkbox **"Keep me logged in"**, link **Forgot password**, dan link **create here** (register). Jangan kosongkan elemen yang ada di NodeAdmin.

#### Manifest file sumber yang WAJIB direplikasi 1:1 (path di `src/`)
Replika **setiap** file ini; jangan tambah/kurang halaman, jangan ubah penamaan.

| Sumber NodeAdmin (`src/`) | Yang direplikasi |
|---|---|
| `resources/layouts/be/default/{head,sidebar,topbar,main,foot}.ejs` | chrome admin (head themeable + kelas komponen, sidebar menu, topbar user-dropdown, foot Toast/Modal/Confirm/dropdown JS) |
| `resources/layouts/be/default/full-width.ejs` | layout auth (tanpa sidebar, terpusat) |
| `modules/dashboard/views/be/default/index.ejs` | Dashboard (stat-card+counter, 2 chart, activities, top products, **data table**) |
| `modules/components/views/be/default/index.ejs` | UI Components (9 seksi) |
| `modules/setting/views/be/default/index.ejs` | Setting (theme swatch + FE template katalog + form) |
| `modules/profile/views/be/default/profile.ejs` | Profile form |
| `modules/access/views/be/default/users/{index,create,edit}.ejs` | User list + form |
| `modules/access/views/be/default/roles/{index,create,edit,permission}.ejs` | Role list + form + **assign-permission** |
| `modules/access/views/be/default/permission/{index,create,edit}.ejs` | Permission list + form |
| `modules/auth/views/be/default/{login,register,reset_req,reset_proc}.ejs` | Halaman auth |
| `modules/auth/views/be/default/mail/otp.ejs` | Email OTP (template HTML) |

#### Struktur TABEL index kanonik (SEMUA modul WAJIB identik strukturnya)
Acuan tunggal: `access/.../users/index.ejs`. Hanya **kolom data** yang beda antar-modul; kerangka tabel HARUS sama persis di tiap modul:

```
<div class="tw-card p-0 overflow-hidden">
  <div class="px-6 py-4 border-b flex items-center justify-between">
    <h2 style="color:var(--primary)">{Modul} List</h2>
    <div class="btn-group btn-sm">
      <a class="btn btn-success btn-sm" href="{create}"><i class="fas fa-fw fa-plus"></i> Add Data</a>
      <button class="btn btn-danger btn-sm" form="selection" formaction="{delete_selected}" data-confirm="…"><i class="fas fa-fw fa-times"></i> Delete Selected</button>
    </div>
  </div>
  <div class="p-4" style="overflow-x:auto">
    <table class="table table-bordered table-hover align-middle">
      <thead>
        <!-- BARIS 1: FILTER (form#searchform, GET) -->
        <tr><th></th>
          <th>{select q_page_size: 10/20/50/100}</th>
          {th input filter PER KOLOM: q_code/q_name/q_phone/q_email …}
          {th select q_status, q_role …}
          <th><div class="btn-group"><button class="btn btn-sm btn-success">search</button><a class="btn btn-sm btn-danger" href="{index}">reset</a></div></th>
        </tr>
        <!-- BARIS 2: HEADER -->
        <tr><th><input type="checkbox" id="checkall"></th><th>No</th>{…kolom…}<th>Action</th></tr>
      </thead>
      <tbody> <!-- form#selection, POST -->
        {tiap baris}
        <td><input name="selected[]" value="{id}" type="checkbox"></td>
        <td>{no = page_size*(page-1)+i+1}</td> {…data…}
        <td>Status: Active→<i class="fas fa-check-circle text-green-500 text-xl"> / else <i class="fas fa-times-circle text-red-500 text-xl"></td>
        <td>Picture: <img style="max-width:…"></td>
        <td>Roles: <span class="badge text-bg-primary">{name}</span> …</td>
        <td>Action: <div class="btn-group"><button class="btn btn-sm btn-primary dropdown-toggle" data-toggle-dd>Action</button>
            <div class="dropdown-menu dropdown-menu-end"><a class="dropdown-item">Edit</a><div class="dropdown-divider"></div><a class="dropdown-item danger" data-confirm>Delete</a></div></div></td>
      </tbody>
    </table>
    {pagination numerik: Previous / 1..n / Next}
  </div>
</div>
<script>$("#checkall").click(function(){ $('input:checkbox').not(this).prop('checked', this.checked); });</script>
```

**Wajib ADA di tiap tabel:** thead **2 baris** (filter + header), **select-all** (`#checkall`), **No urut** ber-offset paginasi, **Status sebagai IKON**, **Roles sebagai badge** `text-bg-primary`, **Action dropdown** (Edit + Delete `data-confirm`), **Delete Selected** (bulk), **q_page_size** + **filter per-kolom** (server-side), **pagination numerik**.

**Kolom per modul (struktur sama, data beda) + filter per-kolom:**
- **User**: No · Code · Name · Phone · Email · Status(ikon) · Picture · Roles(badge) · Action — filter `q_code/q_name/q_phone/q_email/q_status/q_role`
- **Role**: No · Name · Status(ikon) · Description · Action — filter `q_name/q_status/q_desc`
- **Permission**: No · Name · Method(badge) · Status(ikon) · Description · Action — filter `q_name/q_method/q_status/q_desc`

> Entity Role & Permission WAJIB membawa kolom ini agar tabel 1:1: Role `status`(varchar20 default Active)+`description`; Permission `method`+`status`(default Active)+`description`. JANGAN sederhanakan jadi name-only (mis. gaya Spatie) — itu tepat memicu gejala "tabel belum sama".

> Gejala "belum sama": tabel pakai search tunggal (bukan filter per-kolom), kolom hilang (mis. Phone), tanpa select-all/Delete-Selected/q_page_size, atau Status berupa teks (bukan ikon). Itu **belum** memenuhi struktur kanonik.

#### Konsistensi tema (switchable) di SEMUA view
Tiap render admin meng-inject `theme/themeName/themes/setting` ke locals; chrome memetakan ke CSS vars + Tailwind colors. **Setiap** view (termasuk dashboard chart, badge, tombol) WAJIB memakai `var(--primary)`/kelas bertema — sehingga ganti tema mengubah seluruh tampilan. Uji: login → ganti tema di Setting → semua halaman ikut berubah warna.

> **Aturan emas UI**: reviewer NodeAdmin harus mengenali hasil porting sebagai "admin yang sama" — struktur layout, penamaan & urutan menu, named-route, dan gaya komponen identik; hanya idiom framework target yang berbeda. **Verifikasi tiap item checklist di atas, bukan asumsi dari test hijau.**

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

### Skema DB KANONIK — WAJIB byte-identik lintas SEMUA port (DB bisa di-switch antar bahasa)

**Tujuan**: satu database bisa dipakai bergantian oleh port bahasa apa pun (NodeAdmin ↔ GoAdmin ↔ LaravelAdmin ↔ …) **tanpa migrasi/transform**. Karena hampir semua ORM menyusun daftar kolom SELECT dari model, **beda nama/keberadaan kolom = error runtime**. Maka skema (nama tabel, nama kolom, tabel join) HARUS sama persis di semua port. NodeAdmin = sumber kebenaran.

**Aturan WAJIB (jangan andalkan konvensi-default ORM — tiap ORM beda!):**
1. **Nama tabel di-PIN eksplisit** (snake_case jamak): `users`, `roles`, `permissions`, `settings`. Jangan biarkan ORM auto-pluralize/casing sendiri (TypeORM/GORM/Eloquent beda aturan).
2. **Tabel join di-PIN nama + kolomnya**: `users_roles(user_id, role_id)` PK gabungan; `roles_permissions(role_id, permission_id)` PK gabungan. ORM default-naming join SANGAT beragam (`role_user` Eloquent, `user_roles_role` TypeORM-auto, dst) → **set manual**.
3. **`id` = `varchar(36)` (UUID string)** di SEMUA tabel — BUKAN auto-increment int, BUKAN tipe `uuid` native — agar nilai PK/relasi identik & portabel antar port.
4. **Status = `varchar(20)`** berisi `'Active'`/`'Inactive'` (BUKAN ENUM native). `password_otp_expires` = `bigint` (epoch ms). Timestamp pakai tipe abstrak `timestamp`.
5. **Kolom audit di SEMUA tabel utama**: `created_by varchar(36)`, `updated_by varchar(36)`, `created_at`, `updated_at`.
6. **Kolom `desc` adalah RESERVED WORD** (roles & permissions). Tetap dipakai (ikut NodeAdmin) → di raw-SQL quote per-dialek (Postgres native `"desc"`, MySQL backtick atau set `sql_mode=ANSI_QUOTES` lalu `"desc"`); via ORM, andalkan auto-quote (mis. GORM tag `column:desc`). JANGAN ganti jadi `description` di satu port saja → memecah kompatibilitas.
7. **Keunikan kolom WAJIB sama** (nama index boleh beda — kosmetik): `users.code` UNIK, `users.email` UNIK, `roles.name` UNIK, **`permissions.name` NON-unik**.
8. **`guard_name` `varchar(20)` def `'web'`** di `roles` & `permissions` — jalur auth (`'web'` panel sesi / `'api'` REST+JWT), dipakai untuk **filter/kategorisasi** (filter `q_guard`). Permission ter-auto-register dari route bernama: `api.*` → guard `api`, selainnya `web`. WAJIB ada di semua port (jangan dihapus — itu memecah skema lintas-port).

**Definisi tabel kanonik** (tipe = keluarga portabel; panjang varchar mengikuti NodeAdmin):

`users`: `id` varchar(36) PK · `code` varchar(20) UNIK · `name` varchar(50) · `phone` varchar(15) · `email` varchar(255) UNIK · `email_verified_at` timestamp null · `password` varchar(255) · `password_otp` varchar(255) null · `password_otp_expires` bigint null · `status` varchar(20) def 'Active' · `picture` varchar(255) null · `blocked` boolean def false · `blocked_reason` varchar(255) null · `timezone` varchar(255) def 'UTC' · `created_by` · `updated_by` · `created_at` · `updated_at`

`roles`: `id` varchar(36) PK · `name` varchar(255) UNIK · `guard_name` varchar(20) def 'web' (index) · `status` varchar(20) def 'Active' · `desc` varchar(255) null · `created_by` · `updated_by` · `created_at` · `updated_at`

`permissions`: `id` varchar(36) PK · `name` varchar(255) **(index, NON-unik)** · `guard_name` varchar(20) def 'web' (index) · `method` varchar(255) null · `status` varchar(20) def 'Active' · `desc` varchar(255) null · `created_by` · `updated_by` · `created_at` · `updated_at`

`settings` (singleton): `id` varchar(36) PK · `initial` · `name` · `description` text · `icon` · `logo` · `login_image` · `phone` · `address` · `email` · `copyright` (semua varchar(255) null) · `theme` varchar(20) def 'Blue' · `fe_template` varchar(80) · `created_by` · `updated_by` · `created_at` · `updated_at`

`users_roles`: `user_id` varchar(36) · `role_id` varchar(36) · PK(`user_id`,`role_id`)
`roles_permissions`: `role_id` varchar(36) · `permission_id` varchar(36) · PK(`role_id`,`permission_id`)

> **Uji kompatibilitas lintas-port**: buat DB dengan Port A (migrate+seed), arahkan Port B ke DB yang sama tanpa migrasi → login + CRUD user/role/permission harus jalan. Bila gagal SELECT/INSERT karena kolom → skema belum identik. (Index name & panjang varchar TIDAK memutus switch; nama tabel/kolom/join & keberadaan kolom MEMUTUS.)

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
  - Varian Full (UI+API) vs API-only (pilih runtime via env, mis. `APP_MODE`) + command upgrade idempotent (mis. `add-ui`) — diff antar-varian purely-additive
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
| Varian Full vs API-only + upgrade | **build tag** atau **`APP_MODE` env** memilih mode di `main.go` (registrasi router web di-skip pada mode api); modul UI didaftarkan dengan guard kehadiran. Upgrade API→Full = subcommand generator (mis. `go run ./cmd/add-ui`) yang menyalin paket/aset UI yang absent + set `APP_MODE=full`, lalu `go build` + `go test ./...` |

---

## Catatan Penting

1. **Banyak hal jadi lebih mudah** di framework matang (Laravel/Nest/Spring/.NET/Django): DI, validasi, migration, RBAC sudah bawaan. Effort yang kita keluarkan manual di NodeAdmin sebagian **tak perlu** diulang — pakai yang native.
2. **Yang tetap harus dibuat manual** di mana pun: AGENTS.md versi target, convention checker, equivalent /make-module, theme switcher, **frontend template switcher (katalog + paginasi/search server-side + thumbnail/preview cache-klien + unduh on-demand)**, **landing publik data-driven (bind ke Setting)**, struktur modular yang disepakati.
3. **Idiom > kemiripan**: kode harus terasa natural di bahasa target. Reviewer framework itu harus menganggapnya "ditulis oleh developer {FRAMEWORK}", bukan "porting dari JS".
4. **Bertahap & terverifikasi**: fondasi → modul percontohan → guardrail → sisanya; build+test hijau tiap fase.
5. **Test = non-negotiable**: apa pun bahasanya, tiap fitur wajib test (prinsip TDD/BDD dipertahankan).
