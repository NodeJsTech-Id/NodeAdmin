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
| C++ (Drogon) | **CppAdmin** | Kotlin (Ktor) | **KotlinAdmin** |
| PHP Native | **PHPAdmin** | | |

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
- [ ] **App self-bootstrap di dev** — perintah `run` (non-prod) WAJIB **auto-migrate + seed** saat start agar `run` langsung pakai (tak gagal `no such table: users`). Produksi: migrate eksplisit. Seed **idempoten** (uji ≥2×). *(Kesalahan RustAdmin: connect tapi tak migrate → login 500.)*
- [ ] **Render view = `Content-Type: text/html`** — sebagian engine menentukan content-type dari ekstensi nama template; dipadu `nosniff` (helmet), `text/plain` membuat browser menampilkan HTML sebagai **teks mentah**. Pastikan helper render menyetel `text/html`. *(Kesalahan RustAdmin: Tera `.tera` → `text/plain`. Uji `curl -I /`.)*
- [ ] **Belum-login akses route web ter-autentikasi → REDIRECT `/auth/login`** (BUKAN 401/404); API → **401 JSON**. Jika guard tak bisa redirect langsung → tangani via **catcher/error-handler** (401 web→redirect login, `/api`→JSON; 403 web→dashboard). *(Kesalahan RustAdmin: 401 telanjang. NodeAdmin/Go sudah benar.)* Lihat "Pelajaran porting lanjutan (RustAdmin)".
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

**API auth (method WAJIB sama):** `api.v1.auth.login` (**POST**) · `api.v1.auth.logout` (**POST** — logout = mutasi yang mem-blacklist token; **GET tak boleh punya efek samping**) · `api.v1.auth.me` (**GET**) · `api.v1.auth.register` (POST) · `api.v1.auth.reset.{request,process}` (POST). (Pelajaran: NodeAdmin/GoAdmin sempat memakai **GET** untuk api logout → diperbaiki ke **POST**; samakan di semua port.)

**Method-override + DELETE-delete (WAJIB ditiru):**
- **update = PUT** & **delete = DELETE** via form HTML (hanya GET/POST) → `<form method="POST" action=".../update?_method=PUT">` / `<form method="POST" action=".../delete?_method=DELETE">` + **middleware/wrapper method-override** yang membaca `?_method` SEBELUM routing (di Go/Gin: bungkus engine di level `http.Server`, bukan middleware grup — Gin me-routing by method lebih dulu). Override hanya untuk POST→{PUT,PATCH,DELETE}.
  - **Padanan per-framework override**: **Spring** punya `HiddenHttpMethodFilter` **bawaan** (baca param `_method` pada form `POST`; aktifkan `spring.mvc.hiddenmethod.filter.enabled=true`) — karena filter membaca `_method` dari **parameter** & CSRF Spring Security via token, taruh `_method`+`_csrf` di **query** action agar konsisten dengan caveat DELETE di atas. **.NET ASP.NET Core TIDAK punya override bawaan** → tambahkan **middleware kustom** yang menerjemahkan `POST` + `?_method=PUT|DELETE` ke method asli **SEBELUM `UseRouting()`** (bukan setelah — routing memilih endpoint by method lebih dulu), lalu handler `[HttpPut]/[HttpDelete]`; antiforgery token dibaca dari **header/query** (bukan body, karena DELETE).
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
- **Rich text editor (Trumbowyg) + FILE MANAGER** di UI Components (seksi 8) + field deskripsi: `<textarea class="trumbowyg-editor form-control">`, init di `foot` (toolbar format/list/link/**filemanager**/fullscreen), **sinkron HTML editor → textarea saat submit**. **Tombol "File Manager"** (plugin `filemanager`) buka modal: **upload/list/hapus gambar** ke storage lalu sisip `<img>`. Butuh **modul `media`** dgn endpoint AJAX (sesi + CSRF via header): `GET /admin/v1/media/list`, `POST …/upload` (validasi magic-byte + re-encode, simpan ke sub-folder **`editor/`** storage → `{name,url,key}`), `POST …/delete` (key divalidasi anti path-traversal `editor/<nama-aman>`). Plugin JS (`vendor/trumbowyg/filemanager.js`) baca CSRF dari `<meta name="csrf-token">` → kirim header `x-csrf-token`. JANGAN cukup `insertImage` base64 — replika file manager NodeAdmin (modal grid penuh: list+upload+delete+sisip; BUKAN stub yang cuma buka file-picker). **Pitfall lintas-port**: plugin kirim **upload = `multipart/form-data`** (field `file`) dan **delete = form-urlencoded** (`key=…`, default `$.ajax`) — endport WAJIB menerima content-type itu (mis. RustAdmin `delete` pakai `Form<DeleteBody>` bukan `Json<…>`), kalau tidak request 4xx senyap. CSRF tetap via header (bukan body).
- **Frontend Template switcher DI-FOLD ke halaman Setting** (BUKAN menu terpisah, **BUKAN halaman/route/modul "appearance" terpisah**): kartu katalog (thumbnail iframe ter-scale + modal preview + cache-klien) + paginasi/search server-side ada DI halaman Setting; **pemilihan disimpan via form Setting utama** (hidden `fe_template` → `PUT /admin/v1/setting/update`, diunduh saat Save — **TANPA endpoint apply terpisah**). Pakai param sendiri (`fe_page`/`fe_search`/`fe_category`) agar tak bentrok form Setting. Proxy pratinjau = **`admin.v1.setting.fe_preview`** (`/admin/v1/setting/fe-preview/:slug`, namespace setting). **Anti-pattern (jangan diulang):** membuat modul/halaman `appearance` standalone dgn route `admin.v1.appearance.*` + tombol apply sendiri → menyimpang dari NodeAdmin (orphan, tak ada di sidebar).
- **Input file = `.form-control` POLOS (sama persis input lain)** — NodeAdmin TIDAK menata `::file-selector-button`/tombol-pemilih custom; cukup `class="form-control"` (kotak ber-border + padding) + tombol native browser apa adanya. **JANGAN over-style** tombol pemilih (justru bikin beda dgn NodeAdmin). Pastikan kelas `.form-control` IDENTIK di kedua app (border/rounded/padding/focus-ring).
- **Preview gambar field upload SELALU dirender** (di kiri input file): `<img src="{nilai}">` di-render **tanpa guard `if`** — saat nilai kosong/rusak, **bukan dibiarkan kosong** melainkan jatuh ke **placeholder**. Mekanisme: **fallback gambar GLOBAL** di `foot` (NodeAdmin `foot.ejs`) — listener `error` (capture) + cek `img.complete && naturalWidth===0` saat load → ganti `<img>` gagal/kosong dengan **kotak placeholder** (`<span>` abu-abu + ikon Font Awesome: `fa-user` bila avatar (class/alt mengandung user/picture/avatar/rounded-full), selain itu `fa-image`), ukuran mengikuti `width/height` gambar. Berlaku app-wide (setting icon/logo/login_image, profile/user avatar, logo sidebar/topbar). PITFALL nyata: men-guard `{{if .Picture}}<img>{{end}}` → slot kosong saat belum ada gambar (beda dgn NodeAdmin yang selalu tampil placeholder).
- **Rich editor di field rich-text lain**: bukan cuma showcase — **deskripsi Setting** (dan field rich lain) pakai `class="trumbowyg-editor form-control"` (editor + file manager). Konten HTML WAJIB **disanitasi di server saat simpan** (whitelist tag aman, buang `<script>`/`onerror`/`javascript:`; NodeAdmin `cleanRichText`/sanitize-html, Go `bluemonday`) lalu **dirender MENTAH** di tempat tampil (landing: `<%- %>` / `template.HTML`/`safeHTML`) — bukan escaped. Round-trip: textarea simpan HTML mentah; Trumbowyg baca via value (entity ter-decode otomatis di RCDATA).
- **Login** = **2 PANEL 1:1** (BUKAN kartu tunggal terpusat — kesalahan RustAdmin): panel kiri `sidebar-gradient` berisi **login_image** (`getFile('/modules/setting/login-image.png')`, sembunyi di mobile); panel kanan = **logo Setting** + heading **"Hello, Welcome Back!"** + sub "Enter your credentials to continue" + Email + Password + tombol **Login** full-width, lalu baris **"Keep me logged in"** (checkbox, kiri) & **Forgot password** (kanan), `<hr>`, dan "Don't have an account? **create here**" (register). Bungkus `max-w-5xl tw-card grid md:grid-cols-2`, themed (`var(--primary)`/`.btn-primary-tw`), layout `full-width`. Jangan kosongkan/sederhanakan elemen yang ada di NodeAdmin.

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

### Pelajaran porting lanjutan (RustAdmin/Rocket) — kepatuhan yang SERING meleset (WAJIB)

> Hal-hal berikut **lolos dari "test hijau"** namun bikin app terasa beda/rusak saat dipakai
> manusia. Semua ditemukan saat porting RustAdmin; NodeAdmin & GoAdmin **sudah benar** untuk
> #2 (`res.redirect`/`c.Redirect`) dan #1 (`res.render`/`c.HTML` set `text/html`). Port baru
> WAJIB memeriksa ketujuhnya secara **manual via browser/curl**, bukan hanya test.

1. **Render view WAJIB ber-`Content-Type: text/html`.** Sebagian engine menentukan content-type
   dari **ekstensi nama template**. Pelajaran RustAdmin: `rocket_dyn_templates` memberi `text/plain`
   untuk template berekstensi tunggal `.tera` (nama tanpa `.html` di dalam) → digabung header
   `X-Content-Type-Options: nosniff` (helmet) browser **menampilkan HTML sebagai TEKS MENTAH**,
   bukan render. Pastikan helper render menyetel `text/html` (Express EJS & Go `c.HTML()` sudah
   benar; Rocket/Tera → pakai nama `*.html.tera` ATAU fairing yang menulis `text/html`). **Uji:**
   `curl -I /` & `/auth/login` → `content-type: text/html`.

2. **Belum login akses route web ter-autentikasi → REDIRECT ke `/auth/login` (BUKAN 401/404).**
   API → **401 JSON**. Padanan `ensureAuthenticated` NodeAdmin (`res.redirect('/auth/login')`) &
   GoAdmin (`c.Redirect(302, loginPath)`). Bila guard framework **tak bisa redirect langsung**
   (mis. Rocket Request Guard hanya boleh `Outcome::Error/Forward`) → pakai **catcher/error-handler
   terpusat**: status 401 pada path **web** → redirect login; pada `/api` → JSON 401 (dan 403 web →
   kembali ke dashboard). Bug RustAdmin: guard balas 401 telanjang (halaman error). **Uji:** GET
   route admin tanpa sesi → 30x `Location: /auth/login`; GET `/api/...` → 401 JSON.

3. **App self-bootstrap di DEV.** `run` (non-prod) WAJIB **auto-migrate + seed** saat start agar
   login tak gagal `no such table: users`. Produksi: migrate eksplisit (`migrate up`). Bug
   RustAdmin: app connect tapi tak migrate → login 500. Seed tetap **idempoten** (uji jalankan ≥2×).

4. **Halaman Login = 2 PANEL 1:1 (bukan kartu tunggal).** Replika `auth/login`: **panel kiri**
   `sidebar-gradient` berisi **login_image** (`getFile('/modules/setting/login-image.png')`); **panel
   kanan** = **logo Setting** + heading **"Hello, Welcome Back!"** + sub "Enter your credentials to
   continue" + Email + Password + tombol **Login** full-width + baris **Keep me logged in** (kiri) &
   **Forgot password** (kanan) + `<hr>` + "Don't have an account? **create here**". Themed
   (`var(--primary)`/`.btn-primary-tw`), layout `full-width` terpusat (`max-w-5xl grid md:grid-cols-2`).

5. **Dashboard/Components/Profile/Setting WAJIB konten PENUH — jangan disederhanakan** (porting
   cenderung bikin versi ringkas):
   - **Profile** = **FORM USER PENUH** (judul "User Form"): Code · Name · Phone · Email · **Timezone**
     · Password+Confirm · **Status** · **Picture + preview**. Service `updateProfile` memegang semua
     field ini **kecuali roles**. JANGAN persempit jadi name/email/phone/password.
   - **Dashboard** = "Dashboard Overview" + welcome + tanggal · **4 stat card** (Users/Roles/
     Permissions/**Active Theme**) + **animasi counter** · **2 chart** (line+doughnut, warna ikut
     `theme`) · **Recent Activities** · **Top Products** (badge ranking) · **Recent Orders** data-table
     (thead 2-baris filter + select-all + bulk + pagination).
   - **UI Components** = **9 seksi** (stat+counter · chart · badge/status · alert · button+dropdown ·
     **Modal/Toast/Confirm** · form+preview file · **Trumbowyg+File Manager** · data table+pagination).
   - **Setting** = **swatch tema** (grid; tiap swatch = **4 STRIP** warna dark/primary/secondary/light +
     nama + ikon check) + **katalog FE** (filter kategori + thumbnail iframe + modal preview) + **Setting
     Form** lengkap dgn label gaya `[field]` (initial/name/description-richtext/icon/logo/login_image/
     phone/address/email/copyright) + **preview gambar** tiap field file.

6. **Frontend template switcher harus BENAR-BENAR berfungsi end-to-end — jangan berhenti di fallback
   kurasi.** WAJIB: (a) fetch katalog **live** opentailwind (GitHub tree ≈640) → cache memori 6 jam +
   disk `_catalog.json`; fallback kurasi HANYA saat sumber offline; (b) thumbnail/preview = HTML
   **asli** dari `RawBaseURL/{slug}.html` (BUKAN placeholder karangan); (c) saat dipilih + **Save** →
   **unduh & cache** lalu landing `/` **benar-benar berganti** ke template itu (default = view native
   kaya). Kekurangan RustAdmin: hanya katalog kurasi ~6 item + preview placeholder → switcher
   **tidak benar-benar berfungsi**. **Uji:** pilih template non-default → Save → buka `/` → tampil
   desain itu (bukan default).

7. **Autoescape engine + URL tepercaya.** Engine yang autoescape (Tera) meng-escape `/` pada output
   helper `route()/getFile()` → atribut `href`/`src` rusak (`&#x2F;`). **Tandai output URL sebagai
   aman** (mis. Tera `| safe`) atau matikan escape khusus nilai URL — JANGAN biarkan ter-escape.
   (Berlaku juga ke query-string pagination gabungan.)

8. **FIELD form/view = CERMIN PERSIS field + kolom DB NodeAdmin (jangan dihilangkan / disederhanakan
   / diubah desainnya).** ⚠️ **TEKANAN UTAMA.** Setiap field di setiap form & view WAJIB mengacu ke
   **field + kolom DB NodeAdmin**: keberadaannya, **nama**, **label**, **urutan**, **tipe input**,
   validasi, DAN **desain + layout**-nya. JANGAN menghilangkan field (kesalahan RustAdmin: form User
   create/edit tadinya **TANPA field Picture** sama sekali) maupun menyederhanakan tampilannya.
   - **Field gambar/file** (Picture, icon, logo, login_image, avatar): input = **`.form-control`
     POLOS** (tombol native browser; **JANGAN** menata `::file-selector-button`/tombol custom) + **`<img>`
     preview SELALU dirender TANPA guard `{% if %}`/`{{if}}`** (kosong/rusak → **fallback gambar global**,
     bukan slot kosong/ikon manual) + handler **`previewImage()`** (pratinjau sebelum submit) + form
     **`enctype="multipart/form-data"`**. Layout: label → `.preview`(img) → input file.
   - **ANTI-PATTERN (jangan ulangi):** `{{if .Picture}}<img src=…>{{else}}<i …>{{end}}` — itu meng-guard
     `<img>` (slot kosong / ikon manual saat belum ada gambar) → BEDA dari NodeAdmin yang **selalu**
     merender `<img>` lalu menyerahkan ke fallback global. Ditemukan di GoAdmin (index User + sebagian
     auth page) → diperbaiki agar `<img>` selalu render. Berlaku app-wide: tabel index, form, avatar
     topbar, logo/icon/login_image Setting & halaman login.
   - **Cara verifikasi**: buka tiap form/view berdampingan dengan NodeAdmin; cocokkan **daftar field**
     terhadap **tabel kolom kanonik** (lihat "Skema DB KANONIK" di bawah) — tidak ada kolom relevan yang
     hilang dari UI, tidak ada field tambahan karangan, dan desain/layout tiap field identik.

9. **Resolusi path aset/template/cache/upload JANGAN relatif-CWD.** Bug RustAdmin: `FileServer` &
   `template_dir` memakai path relatif → **panic "is not a directory"** saat app dijalankan dari folder
   selain root project. Resolve SEMUA path filesystem — static, direktori template, cache katalog FE
   (`public/fe/templates`, `_catalog.json`), storage upload (`storage/editor/`) — terhadap **basis yang
   stabil**: root aplikasi yang dideteksi (env `APP_ROOT` → root build/manifest saat dev → CWD hanya
   sebagai fallback terakhir), BUKAN CWD mentah. Padanan port baru: **Spring** = template/aset di
   **classpath** (`src/main/resources/templates|static`, robust di dalam JAR) + direktori storage/cache
   di-set absolut via `application.yml` (jangan path relatif); **.NET** = `IWebHostEnvironment`
   `ContentRootPath`/`WebRootPath` + `Path.Combine`, **bukan** `Directory.GetCurrentDirectory()` mentah.
   **Uji:** jalankan binary/jar dari direktori lain (`cd /tmp && run`) → tetap melayani aset, render
   template, dan baca/tulis cache FE + upload editor.

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

> ⚠️ **Skema ⇄ UI WAJIB sinkron.** Tabel kolom di bawah BUKAN hanya kontrak DB — ia juga **kontrak UI**:
> setiap kolom yang relevan WAJIB muncul di form/view yang bersangkutan dengan **field + desain/layout
> NodeAdmin** (lihat pelajaran #8 "FIELD form/view = CERMIN PERSIS" + "Standar UI Admin"). Mis. kolom
> `users.picture`/`settings.{icon,logo,login_image}` → field file `.form-control` polos + `<img>` preview
> selalu render. JANGAN ada kolom yang punya data tapi tak ada field-nya di UI (kesalahan RustAdmin:
> kolom `picture` ada di DB tapi field Picture hilang dari form User).

**Aturan WAJIB (jangan andalkan konvensi-default ORM — tiap ORM beda!):**
1. **Nama tabel di-PIN eksplisit** (snake_case jamak): `users`, `roles`, `permissions`, `settings`. Jangan biarkan ORM auto-pluralize/casing sendiri (TypeORM/GORM/Eloquent beda aturan).
2. **Tabel join di-PIN nama + kolomnya**: `users_roles(user_id, role_id)` PK gabungan; `roles_permissions(role_id, permission_id)` PK gabungan. ORM default-naming join SANGAT beragam (`role_user` Eloquent, `user_roles_role` TypeORM-auto, dst) → **set manual**.
3. **`id` = `varchar(36)` (UUID string)** di SEMUA tabel — BUKAN auto-increment int, BUKAN tipe `uuid` native — agar nilai PK/relasi identik & portabel antar port.
4. **Status = `varchar(20)`** berisi `'Active'`/`'Inactive'` (BUKAN ENUM native). `password_otp_expires` = `bigint` (epoch ms). Timestamp pakai tipe abstrak `timestamp`.
5. **Kolom audit di SEMUA tabel utama**: `created_by varchar(36)`, `updated_by varchar(36)`, `created_at`, `updated_at`.
6. **Kolom `desc` adalah RESERVED WORD** (roles & permissions). Tetap dipakai (ikut NodeAdmin) → di raw-SQL quote per-dialek (Postgres native `"desc"`, MySQL backtick atau set `sql_mode=ANSI_QUOTES` lalu `"desc"`); via ORM, andalkan auto-quote (mis. GORM tag `column:desc`). JANGAN ganti jadi `description` di satu port saja → memecah kompatibilitas.
7. **Keunikan kolom WAJIB sama** (nama index boleh beda — kosmetik): `users.code` UNIK, `users.email` UNIK, `roles.name` UNIK, **`permissions.name` NON-unik**.
8. **`guard_name` `varchar(20)` def `'web'`** di `permissions` SAJA (BUKAN di `roles`) — jalur auth (`'web'` panel sesi / `'api'` REST+JWT), dipakai untuk **filter/kategorisasi** (filter `q_guard`). Permission ter-auto-register dari route bernama: `api.*` → guard `api`, selainnya `web`. WAJIB ada di tabel `permissions` di semua port (jangan dihapus — itu memecah skema lintas-port). **Tabel `roles` TIDAK memiliki kolom `guard_name`.**

**Definisi tabel kanonik** (tipe = keluarga portabel; panjang varchar mengikuti NodeAdmin):

`users`: `id` varchar(36) PK · `code` varchar(20) UNIK · `name` varchar(50) · `phone` varchar(15) · `email` varchar(255) UNIK · `email_verified_at` timestamp null · `password` varchar(255) · `password_otp` varchar(255) null · `password_otp_expires` bigint null · `status` varchar(20) def 'Active' · `picture` varchar(255) null · `blocked` boolean def false · `blocked_reason` varchar(255) null · `timezone` varchar(255) def 'UTC' · `created_by` · `updated_by` · `created_at` · `updated_at`

`roles`: `id` varchar(36) PK · `name` varchar(255) UNIK · `status` varchar(20) def 'Active' · `desc` varchar(255) null · `created_by` · `updated_by` · `created_at` · `updated_at`

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
> **Versi target (stabil): Laravel 13.x + PHP 8.3+** (latest: v13.16.1, rilis Juni 2026). `composer create-project laravel/laravel LaravelAdmin` otomatis mengunduh L13. PHP minimum **8.3**. Pakai rilis GA; hindari RC/beta.
>
> **Perubahan struktural L11+ yang WAJIB diikuti** (beda dari L10 ke bawah):
> 1. **Tidak ada `App\Exceptions\Handler.php` dan `Kernel.php`** — keduanya dihapus sejak L11. Exception handler → `bootstrap/app.php` → `->withExceptions(fn(Exceptions $e) => ...)`. Middleware pipeline → `->withMiddleware(fn(Middleware $m) => ...)`.
> 2. **`AppServiceProvider` tunggal** — bukan banyak provider pisah (Auth/Route/Event). Bind service di `register()`; `View::share()`, event listener, dll di `boot()`.
> 3. **Route API opt-in** — `php artisan install:api` (tidak ada secara default). Routes: `web.php` + `api.php` (opt-in) + `console.php`.
> 4. **PHPUnit 12 (bundled, sudah include)** — Pest belum support Laravel 13 (`pest-plugin-laravel` max hanya `^12.x`); jangan install Pest untuk L13 sampai ada rilis resmi. Gunakan PHPUnit yang sudah terpasang.
>
> **Fitur baru L13 yang relevan untuk porting ini:**
> - **`#[Middleware]` + `#[Authorize]` attribute** langsung di class/method controller — idiom deklaratif baru, lebih bersih dari `middleware()` di konstruktor.
> - **`PreventRequestForgery` middleware** — CSRF baru L13, origin-aware; menggantikan `VerifyCsrfToken`. Terdaftar otomatis; JANGAN extend `VerifyCsrfToken` lama.
> - **Expanded `#[Attribute]` support** di Eloquent, controller, job (mis. `#[Tries]`, `#[Backoff]`, `#[Timeout]`).

| Konsep NodeAdmin | Padanan Laravel |
|---|---|
| Modular per fitur | `nwidart/laravel-modules` (rekomendasi) atau folder `app/Modules/{Modul}/` + `{Modul}ServiceProvider` di-register di `bootstrap/providers.php` |
| DI (tsyringe) | **Service Container (bawaan)** — bind `IUserService::class → UserService::class` di `AppServiceProvider::register()`; inject via constructor controller (auto-resolve) |
| Service + Interface | `interface IUserService` + `class UserService implements IUserService`; bind di `AppServiceProvider`; controller terima via constructor injection |
| Controller tipis + handler() | `ResourceController` — method `index/create/store/edit/update/destroy`; logika di service; **L13**: `#[Middleware('auth')]` + `#[Authorize(...)]` attribute di class/method |
| Validator Joi stripUnknown | **FormRequest** → `$request->validated()` (bawaan, whitelist otomatis — hanya field di `rules()` yang lolos, anti mass-assignment); `$request->safe()->only([...])` untuk subset |
| Error terpusat | Exception custom + **`bootstrap/app.php` → `->withExceptions(fn(Exceptions $e) => $e->renderable(fn(AppException $ex, $req) => ...))`** — petakan ke HTTP (web→flash+redirect, API→JSON) |
| Middleware pipeline | **`bootstrap/app.php` → `->withMiddleware(fn(Middleware $m) => ...)`** — daftarkan middleware global/group/alias di sini (bukan `Kernel.php` L10) |
| RBAC route-driven | **`spatie/laravel-permission`** + middleware `permission:`/`role:`; sync permission dari named route via Artisan command custom `permission:sync-routes` (scan `Route::getRoutes()` → upsert permission); Administrator bypass; sidebar gating `$user->can('admin.v1.access.user.index')` |
| Migration portabel | **Migration Laravel (bawaan, DB-agnostik)** — `Schema::create('users', fn($t) => ...)` + tipe abstrak (`string(20)`, `text`, `boolean`, `timestamp`) bukan tipe vendor |
| Entity/Repository (TypeORM) | **Eloquent Model** — PIN `protected $table = 'users'`; `$guarded = ['*']` + `$fillable = [...]` eksplisit; many-to-many: `belongsToMany(Role::class, 'users_roles', 'user_id', 'role_id')` PIN semua argumen |
| View EJS + Tailwind + switcher | **Blade** (`{{ $var }}` auto-escape, `{!! $safeHtml !!}` raw) + Tailwind; theme switcher: `View::share(['theme' => $theme, ...])` di `AppServiceProvider::boot()` → CSS vars di layout blade |
| env tervalidasi | `config/*.php` (baca via `env()`, cast tipe) + fail-fast: `abort_if(app()->environment('production') && empty(env('APP_KEY')), 500)` di `AppServiceProvider` |
| Test Jest/supertest | **PHPUnit 12 (bundled)** — `Feature test` di class `extends TestCase`: `public function test_user_index(): void { $this->actingAs($user)->get('/admin/v1/access/user')->assertOk(); }` ⚠️ Pest belum support L13 (`pest-plugin-laravel` max `^12.x`) — skip sampai ada rilis resmi |
| BDD Cucumber | **Behat** + FeatureContext; atau tunggu Pest L13 support |
| Convention checker | Artisan command custom + **Pint** (formatter Laravel-native) + **Larastan** (PHPStan untuk Laravel) level 8; Composer script `"check": ["pint --test", "phpstan analyse", "phpunit"]` → CI gate |
| /make-module | `php artisan make:module {Modul}` (custom generator via `php artisan stub:publish` + command) atau `nwidart/laravel-modules` → `php artisan module:make {Modul}` |
| Redis session | **driver session `redis` (bawaan)** — `SESSION_DRIVER=redis` di `.env`; `predis/predis` atau `phpredis` extension |
| CSRF (L13) | **`PreventRequestForgery` middleware** (bawaan L13, origin-aware, terdaftar otomatis) — form DELETE: `@csrf` + `@method('DELETE')` di Blade; JANGAN extend `VerifyCsrfToken` lama |
| Method-override (PUT/DELETE form) | **Bawaan Laravel** via Blade: `@method('PUT')` / `@method('DELETE')` — Laravel baca `_method` dari body POST otomatis; tidak perlu middleware tambahan |
| Route API | `php artisan install:api` (opt-in di L11+; tidak ada secara default) |

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
> **Versi target (stabil): Spring Boot 3.5.x + Java 21 LTS**, build Maven, rilis GA (hindari milestone/SNAPSHOT).

| Konsep NodeAdmin | Padanan Spring Boot |
|---|---|
| Modular per fitur | package per fitur / Maven module |
| DI (tsyringe) | **`@Component`/`@Service` + `@Autowired` (bawaan)** |
| Service + Interface | interface + `@Service` impl (bawaan, idiomatik) |
| Controller + handler() | `@RestController` / `@Controller` |
| Validator | **Bean Validation `@Valid` + DTO (bawaan)** |
| Error terpusat | **`@ControllerAdvice` + `@ExceptionHandler` (bawaan)** |
| RBAC | **Spring Security** + `@PreAuthorize` (entry-point: web→redirect `/auth/login`, `/api/**`→401 JSON) |
| ORM / Migration | **Spring Data JPA / Hibernate** + **Flyway/Liquibase** (DDL kanonik; `ddl-auto=validate` — JANGAN `create/update`) |
| Method-override (PUT/DELETE form) | **`HiddenHttpMethodFilter` (bawaan)** — `_method`+`_csrf` di query action |
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
> **Versi target: .NET 10 LTS (C# 14) — `dotnet new webapi --framework net10.0`**, **EF Core 10**. Pin paket versi GA (JANGAN preview/rc); `Program.cs` minimal-hosting (BUKAN `Startup.cs` lama).

| Konsep NodeAdmin | Padanan ASP.NET Core |
|---|---|
| Modular per fitur | folder/Feature (Vertical Slice) atau Class Library per modul |
| DI (tsyringe) | **DI bawaan `IServiceCollection` (`AddScoped` dll)** |
| Service + Interface | `interface IXService` + impl, register di `Program.cs` |
| Controller + handler() | **`[ApiController]` Controller (bawaan)** / Minimal API |
| Validator | **FluentValidation** atau DataAnnotations + ModelState |
| Error terpusat | **Exception middleware / `IExceptionHandler` (bawaan .NET 8)** |
| RBAC | **ASP.NET Identity + Authorization Policy/`[Authorize(Roles)]`** (entry-point: web→redirect `/auth/login`, `/api/**`→401 via `OnRedirectToLogin`) |
| ORM/Migration | **Entity Framework Core + Migrations (bawaan, DB-agnostik)** — PIN tabel/join/`desc`/`varchar(36)` via Fluent API (jangan andalkan konvensi EF); dev auto-apply `db.Database.Migrate()` |
| Method-override (PUT/DELETE form) | ⚠️ **TIDAK ada bawaan** (beda dari Spring) → **middleware kustom** translate `POST`+`?_method` SEBELUM `UseRouting()` |
| Path aset/cache/upload | `IWebHostEnvironment.ContentRootPath`/`WebRootPath` + `Path.Combine` (BUKAN `GetCurrentDirectory()` mentah) |
| View | Razor Pages/Views + Tailwind (atau API + SPA) |
| env | **`appsettings.json` + Options pattern `IOptions<T>` (bawaan)** |
| Test | **xUnit + WebApplicationFactory (integration) + Testcontainers** |
| BDD | **Reqnroll** (penerus SpecFlow — SpecFlow discontinued) |
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

### 3.8 C++ (Drogon)
> **Kenapa Drogon**: Drogon adalah C++ web framework paling aktif + lengkap: async/coroutine native (C++20 `co_await`), ORM built-in (model di-generate dari DB), CSP template engine (C++ Server Pages → compile-time), routing deklaratif via macro, session + static file + gzip bawaan. Alternatif (Crow, Pistache, Oat++) lebih minimalis dan kurang matang untuk kebutuhan admin panel penuh. Nama app baku: **CppAdmin**.
>
> ⚠️ **Perbedaan penting dari port lain (WAJIB dipahami sebelum mulai):**
> 1. **Template CSP = compile-time**: `.csp` files dikompilasi ke `.cc` saat `cmake build` — bukan runtime rendering. Ubah template → wajib rebuild. Ini fundamental beda dari EJS/Tera/Blade/Thymeleaf (runtime).
> 2. **No named routes bawaan**: Drogon tak punya registry named-route + reverse-lookup — WAJIB dibangun manual sebagai singleton `RouteRegistry` untuk RBAC route-driven (padanan `getAllRegisteredRoute` NodeAdmin).
> 3. **No migration bawaan**: Drogon ORM generate model dari DB yang sudah ada; migration SQL = tool terpisah (**dbmate** direkomendasikan — SQL plain, multi-DB, CLI ringan). ORM model di-regenerate setiap kali skema berubah.
> 4. **No auto-escape di CSP**: CSP tidak HTML-escape output otomatis → buat helper `htmlEscape(str)` dan pakai konsisten untuk konten user (bukan URL/trusted values).
> 5. **Method-override via filter**: Drogon filter (`HttpFilter`) berjalan sebelum controller (bukan middleware stack Gin/Express) — taruh `MethodOverrideFilter` sebagai filter global, bukan per-grup route.
> 6. **Build complexity**: C++ perlu CMake + paket manager (vcpkg/Conan) + cross-compilation concern yang tidak ada di bahasa lain.

| Konsep NodeAdmin | Padanan C++ + Drogon |
|---|---|
| Modular per fitur | namespace/folder per fitur (`controllers/`, `models/`, `services/`, `filters/`) + registrasi di CMakeLists.txt; `drogon_ctl create controller` bootstrap file controller |
| DI (tsyringe) | Drogon IoC bawaan: `app().registerObject<T>(instance)` + `app().getObject<T>()`, atau **constructor injection manual** (wiring di `main.cc`) untuk service; `DROGON_PLUGIN` untuk plugin siklus-hidup app |
| Service + Interface | pure-virtual class (`struct IUserService { virtual ... = 0; }`) + concrete struct impl; injeksi via konstruktor controller |
| Controller tipis + handler() | `HttpController<T>` + macro `METHOD_LIST_BEGIN` / `ADD_METHOD_TO(T, handler, "/path", Method)` / `METHOD_LIST_END`; body handler di-delegate ke service |
| Validator Joi stripUnknown | whitelist field via struct binding (`Json::Value` / `nlohmann/json`) — parse hanya field yang dikenal, sisanya diabaikan; validasi eksplisit di service (required/max-length/format) |
| Error terpusat | custom exception class + `app().setExceptionHandler(handler)` — tangkap semua uncaught exception, petakan ke HTTP response (web→flash+redirect, API→JSON 4xx/5xx) |
| RBAC | custom `HttpFilter` (cek session/JWT → permission → route) — filter terdaftar di `METHOD_LIST` tiap controller ATAU sebagai global pre-handler; urutan: auth filter → RBAC filter → controller |
| Named routes + RBAC route-driven | **WAJIB dibangun manual**: `RouteRegistry` singleton (`std::unordered_map<std::string, RouteEntry{name,method,path}>`) — isi saat bootstrap (iterasi `ADD_METHOD_TO` entries), scan OTOMATIS ke permission DB saat halaman Permission dibuka (padanan `getAllRegisteredRoute`). Filter RBAC reverse-lookup `(method, path)` → `name` → cek `HasAccess`. Cocokkan name AND method |
| Migration portabel | **dbmate** (SQL plain, multi-DB, CLI: `dbmate up/down/new`); file di `db/migrations/TIMESTAMP_name.sql` — portabel MySQL/PG/SQLite. **JANGAN** bergantung pada `drogon_ctl create model` untuk DDL — itu hanya codegen dari DB yang sudah ada |
| Entity/Repository (TypeORM) | **Drogon ORM** model (di-generate via `drogon_ctl create model -d ./models . sqlite3:test.db`): class `<ModelName>` + `drogon::orm::Mapper<ModelName>` untuk CRUD; async via `co_await mapper.findByPrimaryKey(id)` + C++20 coroutine; **PIN `tableName()` eksplisit** di tiap model (jangan default auto-naming) |
| View EJS+Tailwind+switcher | **CSP (C++ Server Pages)** — `.csp` files dalam `views/` dikompilasi ke `.cc` (cmake target `generate_csp` via drogon `DROGON_VIEWS_DIRECTORY`); inject locals via `HttpViewData`; **theme switcher**: simpan CSS vars di locals tiap render (dari DB setting, cache TTL); **htmlEscape helper** wajib untuk konten user |
| env tervalidasi | **config.json** (Drogon native: `app().loadConfigFile("config.json")`) untuk port/DB/Redis; untuk secrets & env-override gunakan `std::getenv` + struct `AppConfig` tervalidasi di startup (`if (secret.empty()) { LOG_FATAL; exit(1); }`) |
| Session (web) | **Drogon built-in session** (`req->session()->insert(key, val); req->session()->getOptional<T>(key)`) + session store di Redis via `drogon::nosql::RedisClient` (plugin `RedisClientPlugin`) |
| JWT (API) | **`jwt-cpp`** (header-only, HMAC-SHA256, secret dari env) + blacklist token via Redis (`SET token_jti "1" EX ttl`) saat logout; verifikasi: cek signature + exp + blacklist |
| Password/OTP | **`bcrypt`** (libbcrypt atau OpenSSL `EVP`) + OTP via `RAND_bytes` (OpenSSL) → hex-encode → hash sebelum simpan → expiry bigint (epoch ms) + rate-limit per-IP (Redis counter TTL) |
| Rate limit | custom `HttpFilter` per-IP: Redis `INCR`/`EXPIRE` (sliding window) — daftarkan di endpoint sensitif (login/register/reset) |
| Security headers | custom global `HttpFilter` set header (HSTS/X-Frame-Options/X-Content-Type-Options/CSP); CORS via `app().addAllowedOrigin(origin)` + `app().setCORS*()` |
| Kompresi/static cache | `app().enableGzip(true)` (built-in); static file dengan `Cache-Control: max-age=...` via custom response callback atau `app().setStaticFilesCacheTime(60*60*24*7)` |
| CSRF protection | custom `HttpFilter` `CsrfFilter` — generate token (simpan di session), inject ke semua response web, validasi token pada POST/PUT/PATCH/DELETE; form multipart → token di query (sama seperti Go: DELETE tidak parse body) |
| Method-override (PUT/DELETE form) | custom global `HttpFilter` `MethodOverrideFilter` — baca `?_method=PUT|DELETE` dari POST request, set `req->setMethod()` SEBELUM routing (filter berjalan sebelum controller); form delete taruh `_csrf` di query |
| Flash + validasi inline | simpan `errors` + `old` di session (satu-request) → set di filter/helper setelah validasi gagal; redirect (PRG); controller berikutnya baca dari session → inject ke `HttpViewData`; CSP: `<%c++ if(errors.count("name")) { %>is-invalid<%c++ } %>` |
| File storage (OSS) | **`aws-sdk-cpp`** (S3/compatible) atau **Aliyun OSS C++ SDK** + signed URL; validasi magic-byte (baca 16 byte pertama, cocokkan whitelist signature); re-encode gambar via `libvips` atau `stb_image` |
| Email (SMTP) | **`libcurl`** SMTP atau **POCO Net SMTP** (PocoFoundation); template email HTML via CSP atau std::string builder |
| Graceful shutdown | `app().registerSyncAdvice()` + POSIX signal handler (`signal(SIGTERM, ...)` → `app().quit()`) + `std::atomic<bool> shuttingDown` untuk guard async tasks |
| Listen error fail-fast | bungkus `app().run()` — tangkap exception saat bind gagal (port dipakai/permission); `LOG_FATAL << "Port " << port << " sudah dipakai"; exit(1)` |
| Path aset/template/cache | resolve dari `argv[0]` atau `CMAKE_INSTALL_PREFIX` → set `app().setDocumentRoot()` + `app().setViewsPath()` + cache dir secara **absolut** saat startup — JANGAN path relatif-CWD (risk panic saat run dari folder lain) |
| Test | **Drogon test framework** (`drogon::test::*`) + Google Test (gtest) — `drogon::test::DROGON_TEST_MAIN`; test controller via `HttpClient::newHttpClient` + request in-process; DB test pakai SQLite in-memory (config JSON override di test harness) |
| BDD | **`cucumber-cpp`** + gtest BDD-style feature files (`.feature` + step definitions `.cc`) |
| Convention checker | custom CMake target `check_conventions` — script Python/shell yang parse source (`grep`/`clang-tidy` rule): service tak punya interface = fail; controller langsung akses DB = fail; `getenv` di `modules/` = fail; jalankan di CI |
| /make-module | script `tools/make_module.sh` (atau CMake target): generate skeleton folder + controller/service/filter/model/test file dari template (sed/envsubst) + tambah ke CMakeLists.txt |
| Varian Full vs API-only + upgrade | CMake option `-DENABLE_WEB_UI=ON/OFF` (atau env `APP_MODE`): mode api skip pendaftaran CSP views + session + CSRF filter + static admin; mode full aktifkan semua. Guard di `main.cc`: `if (getenv("APP_MODE") == "full") { registerWebModules(); }`. Upgrade: `./tools/add_ui.sh` — salin file view/filter UI yang absent + set APP_MODE + cmake rebuild + run tests |

#### Catatan tambahan Drogon (pelajaran yang SERING terlewat)

- **CSP auto-escape OFF**: berbeda dari Jinja2/Tera/Blade — CSP mencetak nilai apa adanya. Buat helper `std::string h(const std::string& s)` (htmlEscape) dan pakai di SEMUA nilai konten user di template. Pola: `<%c++ output->write(h(user.getValueOfName())); %>`.
- **Coroutine + ORM**: Drogon async ORM pakai `co_await` (C++20). Semua handler yang melakukan query DB harus bertipe `drogon::AsyncTask` atau return `Task<HttpResponsePtr>`. Jangan campurkan callback-style dan coroutine-style dalam satu handler.
- **Model regeneration**: setelah `dbmate up`, jalankan ulang `drogon_ctl create model` untuk regenerate model C++. Build akan gagal bila tabel DB dan model class tidak sinkron (kolom baru di DB tapi tidak ada di model).
- **`tableName()` wajib di-override**: Drogon `getTableName()` default = lowercase class name. PIN eksplisit: `static constexpr const char *tableName = "users";` dalam class model, atau override `static std::string tableName() { return "users"; }`.
- **Join table PIN via SQL**: Drogon ORM tidak manage many-to-many secara deklaratif seperti TypeORM/GORM. Join table `users_roles`/`roles_permissions` = `DbClient::execSqlAsync(...)` raw (dengan PIN nama kolom eksplisit). JANGAN biarkan ORM auto-name join table.
- **`desc` reserved word**: query raw yang menyebut kolom `desc` WAJIB di-quote (MySQL: backtick, PG: `"desc"`). Di Drogon `Mapper` criteria: gunakan `drogon::orm::Criteria("\"desc\"", ...)` (PG) atau `` "`desc`" `` (MySQL).
- **Session + multipart form**: Drogon session lazily-init — pastikan `app().setMaxConnectionNum(...)` dan session middleware aktif via config.json (`"enable_session": true, "session_timeout": 3600`).

### 3.9 Kotlin (Ktor)
> **Kenapa Ktor**: framework Kotlin paling idiomatik untuk backend murni — coroutine native (`suspend fun`, `kotlinx.coroutines`), plugin-based (setiap fitur = plugin eksplisit, bukan convention magic), DSL routing Kotlin, dan satu basis kode untuk multiplatform. Spring Boot (Kotlin) lebih "bawaan" tapi terasa seperti Java; Ktor terasa seperti Kotlin. Nama app baku: **KotlinAdmin**.
>
> **Versi target (stabil)**: **Ktor 3.x + Kotlin 2.x + Java 21 LTS**, build **Gradle Kotlin DSL** (`build.gradle.kts`). Pakai rilis GA (hindari EAP/Alpha/Beta).
>
> ⚠️ **Perbedaan penting Ktor vs Spring Boot / Laravel (WAJIB dipahami sebelum mulai):**
> 1. **Ktor sangat un-opinionated** — hampir tidak ada yang "bawaan" secara otomatis. Setiap fitur (autentikasi, session, CORS, CSRF, kompresi, static files, template engine, JSON, rate-limit) harus di-`install()` eksplisit. Ini trade-off: kontrol penuh, tapi setup lebih banyak.
> 2. **No named routes bawaan** — Ktor routing DSL tidak punya registry bernama + reverse-lookup. WAJIB dibangun manual (`RouteRegistry` singleton) untuk RBAC route-driven, sama seperti Drogon.
> 3. **No built-in CSRF** — Ktor tidak punya CSRF plugin resmi → buat `CsrfPlugin` custom (install sebagai plugin, intercept `ApplicationCall`).
> 4. **No method-override bawaan** — buat `MethodOverridePlugin` custom yang baca `?_method` dari POST SEBELUM routing (`phase = Plugins`).
> 5. **Template engine = FreeMarker/Velocity/Thymeleaf** (semua support auto-escape HTML) atau **kotlinx.html** (type-safe DSL, no injection risk). **Jangan pilih Mustache** untuk admin panel — terlalu terbatas untuk logika UI kompleks (pagination, conditional, loop bersarang).
> 6. **DI = Koin** (rekomendasi untuk Ktor — ringan, native Kotlin, tanpa reflection berat): `startKoin { modules(appModule) }`, inject via `val svc: IUserService by inject()`. Alternatif: Kodein-DI atau manual constructor injection.
> 7. **ORM = Exposed** (JetBrains, native Kotlin) — dua API: **DSL** (type-safe SQL: `Users.select { ... }`) dan **DAO** (Active Record: `UserEntity.findById(...)`). Gunakan **DAO** untuk kemiripan dengan TypeORM/GORM, **DSL** untuk query kompleks. Migration tetap via **Flyway** (Exposed tidak punya versioned migration bawaan — `SchemaUtils.create()` hanya dev/test).

| Konsep NodeAdmin | Padanan Kotlin + Ktor |
|---|---|
| Modular per fitur | package per fitur (`modules/{modul}/`) + **Ktor Application extension function** (`fun Application.moduleFeature()`) yang di-load di `Application.module()`; tiap modul daftarkan route-nya sendiri |
| DI (tsyringe) | **Koin** — `startKoin { modules(appModule) }` di `Application.module()`; `single<IUserService> { UserService(get()) }` di module definition; inject di route: `val svc: IUserService by inject()` |
| Service + Interface | `interface IUserService` + `class UserService : IUserService`; inject via Koin (sisi konsumen pegang interface) |
| Controller tipis + handler() | Ktor **routing DSL** — `route("/admin/v1/access/user") { get { ... } post("/store") { ... } }`; handler tipis, delegate ke service; pisahkan routing ke file `{modul}Routes.kt` |
| Validator Joi stripUnknown | **Konform** (`io.konform:konform`) atau **Valiktor** — validasi deklaratif di service; struct whitelist via **data class** (`receiveOrNull<CreateUserDto>()`) + filter field eksplisit (anti mass-assignment) |
| Error terpusat | **StatusPages plugin** (`install(StatusPages) { exception<AppException> { call, ex -> ... } }`) — petakan `AppException` ke HTTP (web→flash+redirect, API→JSON); JANGAN `try/catch` per-handler |
| RBAC route-driven | **RouteRegistry singleton** (isi saat routing terdaftar via Ktor `RouteSelector` intercept atau wrapper DSL `namedRoute("name", method, "/path") { ... }`) → scan ke permission DB saat halaman Permission dibuka; custom **interceptor plugin** per route: `call.checkAccess(routeName, method)` → 403/redirect |
| Named routes + reverse-lookup | Wrapper DSL `fun Route.namedGet(name: String, path: String, handler: ...)` yang mendaftarkan ke `RouteRegistry(name, GET, path)` saat dipanggil; RBAC reverse-lookup `(method, path) → name` → `HasAccess(name, method)` |
| Migration portabel | **Flyway** (`org.flywaydb:flyway-core`) — SQL plain di `resources/db/migrations/`; auto-apply saat dev (`Flyway.configure().load().migrate()` di startup); `ddl-auto` Exposed = JANGAN `SchemaUtils.createMissingTablesAndColumns` di produksi |
| Entity/Repository (TypeORM) | **Exposed DAO** — `object Users : UUIDTable("users") { val name = varchar("name", 50) ... }` + `class UserEntity(id: ...) : Entity<...>(id) { companion object : EntityClass<...>(Users) }`; query dalam transaction: `transaction { UserEntity.findById(id) }` |
| View + theme switcher | **FreeMarker** (`install(FreeMarker) { ... }`) + Tailwind; inject locals via `FreeMarkerContent("template.ftl", model)`; **auto-escape HTML default aktif** di FreeMarker (`${user.name}` aman); theme switcher: inject CSS vars dari DB setting ke tiap response (`call.respond(FreeMarkerContent(..., mapOf("theme" to theme, ...)))`) |
| env tervalidasi | **HOCON** `application.conf` (Ktor native: `environment.config.property("ktor.database.url").getString()`) + **data class AppConfig** tervalidasi di startup (secret kosong → `error("JWT_SECRET wajib diisi di produksi")`) |
| Session (web) | **Ktor Sessions plugin** (`install(Sessions) { cookie<UserSession>("SESSION") { ... } }`) + custom **Redis session storage** (`SessionStorage` interface impl via `Lettuce`/`Jedis`); `call.sessions.set(UserSession(...))` |
| JWT (API) | **Ktor Authentication + JWT plugin** (`install(Authentication) { jwt("api") { ... } }`) + blacklist token via Redis (`Jedis.setex(jti, ttl, "1")` saat logout); verifikasi: signature + exp + blacklist |
| Password / OTP | **jBCrypt** (`org.mindrot:jbcrypt`) — `BCrypt.hashpw(pwd, BCrypt.gensalt(rounds))` + `BCrypt.checkpw(pwd, hash)`; OTP via `SecureRandom().nextInt(999999)` → pad + hash sebelum simpan + expiry `System.currentTimeMillis()` + rate-limit (Redis counter TTL) |
| Rate limit | **Ktor RateLimit plugin** (built-in sejak Ktor 2.3: `install(RateLimit) { register(RateLimitName("login")) { ... } }`) — pakai `rateLimited(RateLimitName("login"))` di route sensitif (login/register/reset) |
| Security headers | **Ktor CORS plugin** (`install(CORS) { allowHost(...) }`) + custom plugin/intercept yang set HSTS/X-Frame-Options/X-Content-Type-Options/CSP di tiap response |
| CSRF protection | Custom `CsrfPlugin` (Ktor `createApplicationPlugin`) — generate token (simpan di session), inject ke model FreeMarker, validasi POST/PUT/PATCH/DELETE; token di query untuk form DELETE (body tidak di-parse oleh Ktor untuk DELETE) |
| Method-override (PUT/DELETE form) | Custom `MethodOverridePlugin` yang intercept di phase `Plugins.before(Routing)` — baca `?_method=PUT\|DELETE` dari POST, `call.mutableOriginConnectionPoint` tidak bisa diubah method → gunakan `call.attributes.put(OverriddenMethodKey, method)` lalu routing DSL baca atribut ini; **atau** pakai `call.request.queryParameters["_method"]` langsung di handler dengan dispatch manual |
| Flash + validasi inline | Simpan `errors: Map<String, String>` + `old: Map<String, String>` di session (satu-request) setelah validasi gagal → redirect (PRG) → baca di handler berikutnya → inject ke FreeMarker model; FreeMarker: `<#if errors.name??> is-invalid </#if>` + `${(old.name)!field.value}` |
| Kompresi / static files | **Compression plugin** (`install(Compression) { gzip { } }`) + **Static plugin** (`install(StaticContent)` atau `staticResources("/assets", "assets")`) dengan `Cache-Control` header; posisi static SEBELUM route dinamis |
| File storage (OSS) | **AWS SDK for Kotlin** (`aws.sdk.kotlin:s3`) atau `software.amazon.awssdk:s3` (Java SDK) + signed URL; validasi magic-byte (baca 16 byte pertama `InputStream`); re-encode gambar via `javax.imageio.ImageIO` atau `kotlinx-io` |
| Email (SMTP) | **Jakarta Mail** (`org.eclipse.angus:angus-mail`) atau **kotlin-mail** — konfigurasi SMTP dari env; template email via FreeMarker string renderer |
| Graceful shutdown | `embeddedServer(...) { ... }.start(wait = false)` + `Runtime.getRuntime().addShutdownHook(Thread { server.stop(1000, 5000) })` |
| Listen error fail-fast | bungkus `server.start()` dengan `try/catch (BindException)` → log port + `exitProcess(1)` |
| Path aset/template | FreeMarker load dari **classpath** (`ClassTemplateLoader(::class.java.classLoader, "templates")`) → aman di dalam JAR; direktori cache/upload = path absolut dari env `APP_ROOT` atau `System.getProperty("user.dir")` di dev |
| Test | **`ktor-server-test-host`** (`testApplication { application { ... } client.get("/") }`) + **Kotest** (`io.kotest:kotest-runner-junit5`) atau JUnit 5 + **Testcontainers** (MySQL/PG integration); SQLite in-memory via Exposed untuk test cepat |
| BDD | **Cucumber-JVM** (`io.cucumber:cucumber-kotlin`) + Kotest BDD style (`Given`/`When`/`Then` DSL) |
| Convention checker | **Detekt** (`io.gitlab.arturbosch.detekt`) + custom rule: service tanpa interface = error; handler akses DB langsung (tanpa service) = error; `System.getenv` di `modules/` = error; Gradle task `detektMain` + `./gradlew check` di CI |
| /make-module | Gradle task `makeModule` (Kotlin script `buildSrc`) atau script `tools/make_module.kts`: generate folder + `{Modul}Routes.kt` / `{Modul}Service.kt` / `I{Modul}Service.kt` / `{Modul}Repository.kt` dari template string; tambah import ke `modules.kt` |
| Varian Full vs API-only + upgrade | env `APP_MODE=full\|api` dibaca di `Application.module()` — mode `api`: skip `install(Sessions)`, CSRF plugin, FreeMarker, static admin, route web; mode `full`: install semua. Guard: `if (config.appMode == "full") { installWebModules() }`. Upgrade: `./gradlew addUi` (salin resource view yang absent + set APP_MODE=full + rebuild + test) |

#### Catatan tambahan Ktor (pelajaran yang SERING terlewat)

- **Plugin order = KRITIS**: Ktor mengeksekusi plugin sesuai urutan `install()`. `MethodOverridePlugin` WAJIB di-install **sebelum** `Routing` (phase `Plugins`), CSRF **sebelum** route handler. Urutan salah → plugin tidak ter-trigger.
- **`receiveOrNull<T>()` vs `receive<T>()`**: `receive<T>()` throws bila body tidak sesuai → gunakan `receiveOrNull<T>()` untuk form binding yang graceful; validasi eksplisit setelah itu.
- **Exposed transaction context**: semua operasi Exposed WAJIB dalam `transaction { }` atau `newSuspendedTransaction { }` (untuk coroutine). Akses entity di luar transaction = `LazyInitializationException`. Lazy-load tidak ada di Exposed — eager load semua relasi dalam satu transaction.
- **FreeMarker `?html` default**: FreeMarker auto-escape dengan `<#ftl output_format="HTML">` atau via konfigurasi `defaultEncoding`; pastikan template root menyetel output format agar `${user.name}` ter-escape otomatis.
- **Session + multipart form**: Ktor mem-parse multipart body via `call.receiveMultipart()` yang mengkonsumsi body — baca session SEBELUM `receiveMultipart()`, karena setelah itu body sudah habis.
- **Koin + Ktor**: gunakan `koin-ktor` integration (`io.insert-koin:koin-ktor`) yang menyediakan `Application.koin { }` DSL dan `call.get<T>()` extension agar injection berjalan di coroutine scope yang benar.
- **`desc` kolom reserved**: Exposed column definition `val desc = varchar("desc", 255)` aman (Exposed auto-quote nama kolom per dialek); raw SQL via `exec("SELECT ... FROM roles ORDER BY \"desc\"")` perlu quote manual.
- **Many-to-many PIN manual**: Exposed `ManyToMany` tidak otomatis PIN nama join table → definisikan `object UsersRoles : Table("users_roles") { val userId = varchar("user_id", 36) references Users.id; val roleId = varchar("role_id", 36) references Roles.id; override val primaryKey = PrimaryKey(userId, roleId) }` secara eksplisit.

### 3.10 PHP Native
> **Apa yang dimaksud "PHP Native"**: PHP tanpa framework penuh (bukan Laravel/Symfony) — Composer untuk dependency management, PSR-4 autoloading, pilihan library **minimal & bertujuan** (router, DI, ORM standalone, migration), selebihnya memanfaatkan built-in PHP (`password_hash`, `session_*`, `PDO`, dll). Hasilnya harus terasa seperti PHP yang terstruktur dengan baik, bukan terjemahan Node. Nama app baku: **PHPAdmin**.
>
> **Versi target**: **PHP 8.3+**, Composer 2.x, PSR-4/PSR-7/PSR-11/PSR-15 compliant. Gunakan PHP 8 features idiomatik: `match`, named arguments, `readonly` properties, `enum`, `fibers` (opsional untuk async ringan), `#[Attribute]`.
>
> ⚠️ **Perbedaan penting PHP Native vs Laravel (WAJIB dipahami sebelum mulai):**
> 1. **Tidak ada auto-escape**: template PHP (`.php`) mencetak nilai mentah — `<?= $user['name'] ?>` = XSS. WAJIB buat helper `e(string $v): string` (alias `htmlspecialchars($v, ENT_QUOTES, 'UTF-8')`) dan pakai **konsisten** di semua output konten user. Ini padanan `?html` FreeMarker / auto-escape Twig.
> 2. **Tidak ada named routes bawaan**: `nikic/fast-route` tidak punya reverse-lookup nama route. WAJIB bangun `RouteRegistry` (singleton array `name → [method, path]`) untuk RBAC route-driven.
> 3. **Tidak ada middleware pipeline bawaan**: bangun `MiddlewarePipeline` sederhana (array callable + `next()` chaining, padanan PSR-15) atau gunakan `league/pipeline`.
> 4. **Method-override**: baca `$_POST['_method']` atau `$_GET['_method']` di front controller SEBELUM dispatch ke router.
> 5. **Session = PHP built-in** (`session_start()`, `$_SESSION`) — simpan di Redis via `session_set_save_handler()` + `Predis`/`PhpRedis` untuk stateless/horizontal scaling.
> 6. **Template = file `.php`**: fleksibel tapi butuh disiplin. Selalu `echo e($var)` untuk konten user; `echo $safeHtml` hanya untuk HTML yang sudah disanitasi server. Pisahkan view dari logic (`src/views/`), jangan campur query DB di template.
> 7. **Tidak ada hot-reload built-in**: dev server `php -S localhost:8000 public/index.php`; untuk reload otomatis pakai `symfony/var-dumper` atau `spatie/ignition` (dev only).

| Konsep NodeAdmin | Padanan PHP Native |
|---|---|
| Modular per fitur | namespace per fitur (`src/Modules/{Modul}/`) + PSR-4 autoload di `composer.json`; tiap modul registrasikan route-nya sendiri ke `RouteRegistry` via `{Modul}Module::register(RouteRegistry $r): void` |
| DI (tsyringe) | **PHP-DI** (`php-di/php-di`) — `ContainerBuilder` + `definitions.php` (auto-wiring + bind interface ke impl); inject via constructor; `$container->get(IUserService::class)` |
| Service + Interface | `interface IUserService` + `class UserService implements IUserService`; bind di definitions.php `IUserService::class => autowire(UserService::class)`; controller terima via constructor injection |
| Controller tipis + handler() | class `UserController` — method per aksi (`index`, `create`, `store`, `edit`, `update`, `destroy`); konstruktor terima service; handler panggil service + `render()` / redirect; **BUKAN** logic bisnis di controller |
| Validator Joi stripUnknown | **Respect/Validation** (`respect/validation`) — `v::stringType()->length(1, 50)->validate($name)` + collect errors per-field; DTO = PHP 8 `readonly class CreateUserDto { public function __construct(public readonly string $name, ...) {} }` — cast + whitelist eksplisit dari `$_POST` (anti mass-assignment: JANGAN langsung `$_POST` ke model) |
| Error terpusat | custom `AppException` + `set_exception_handler()` di front controller — petakan ke HTTP (web→flash+redirect, API→JSON); JANGAN `die()`/`exit()` di controller/service |
| RBAC route-driven | `RouteRegistry` singleton: `register(string $name, string $method, string $path): void`; tiap `{Modul}Module::register()` isi registry saat boot; middleware `AuthorizeMiddleware` reverse-lookup `(method, path) → name` → `HasAccess(name, method)`; scan ke permission DB saat halaman Permission dibuka; Administrator bypass; sidebar gating `$currentUser->hasAccess($name, 'GET')` |
| Named routes + reverse-lookup | `RouteRegistry::url(string $name, array $params = []): string` (bangun URL dari `name → path` dengan substitusi `{id}` dll); SEMUA `href`/`action` di template pakai `route('admin.v1.access.user.edit', ['id' => $id])` — BUKAN string URL hardcoded |
| Migration portabel | **Phinx** (`robmorgan/phinx`) — `phinx.php` config + `db/migrations/*.php` (PHP class portabel, bukan SQL vendor); `$table->addColumn('name', 'string', ['limit' => 50])` → auto-translate per dialek; `./vendor/bin/phinx migrate` |
| Entity/Repository (TypeORM) | **Eloquent standalone** (`illuminate/database`) — `Capsule::addConnection([...])` + model `class User extends Model { protected $table = 'users'; ... }`; ATAU PDO + Repository pattern (`class UserRepository { public function findById(string $id): ?array { ... } }`) untuk kontrol penuh; Eloquent lebih mudah multi-DB (tinggal ganti driver) |
| View + theme switcher | Template **PHP native** (`.php` files di `src/views/`): `<?php include 'layouts/admin_head.php' ?>` + partial; helper `e()` wajib semua output konten user; **theme switcher**: inject `$theme` (palet dari DB setting) ke tiap render → CSS vars di `admin_head.php` (`<style>:root{--primary:<?= e($theme['primary']) ?>}</style>`); content-type = `text/html` (set di front controller / helper `render()`) |
| env tervalidasi | **`vlucas/phpdotenv`** — load `.env` di `public/index.php` sebelum semua; `$config = new AppConfig($_ENV)` (PHP 8 readonly class); secret kosong di prod → `throw new \RuntimeException('JWT_SECRET wajib diisi')` |
| Session (web) | PHP built-in `session_start()` + custom session handler (`SessionHandlerInterface`) impl via **Predis** (Redis) — `session_set_save_handler(new RedisSessionHandler($predis))` sebelum `session_start()`; JANGAN simpan session di filesystem di produksi |
| JWT (API) | **`firebase/php-jwt`** — `JWT::encode($payload, $secret, 'HS256')` / `JWT::decode()`; blacklist via Redis (`$redis->setex("blacklist:{$jti}", $ttl, '1')`) saat logout; verifikasi: decode + cek blacklist |
| Password / OTP | PHP built-in `password_hash($pwd, PASSWORD_BCRYPT, ['cost' => $rounds])` + `password_verify()`; OTP via `random_bytes(3)` → `bin2hex()` → hash `password_hash` + expiry `time() + 600` + rate-limit (Redis counter `INCR`/`EXPIRE`) |
| Rate limit | custom `RateLimitMiddleware`: Redis `INCR "ratelimit:{ip}:{endpoint}"` + `EXPIRE` — cek counter sebelum lanjut; daftarkan di route sensitif (login/register/reset) |
| Security headers | custom `SecurityHeadersMiddleware` — set `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy`; CORS: header manual untuk API; **`nosniff` wajib** agar template `.php` ber-`Content-Type: text/html` tidak di-sniff ulang |
| CSRF protection | custom `CsrfMiddleware` — generate token `bin2hex(random_bytes(32))` → simpan di session; inject ke semua template (`$_csrf` di context); validasi `$_POST['_csrf']` atau `$_GET['_csrf']` (DELETE/multipart) pada POST/PUT/PATCH/DELETE; **token di query `?_csrf=...`** untuk form DELETE (body PHP parse, tapi konsisten dengan pattern port lain) |
| Method-override (PUT/DELETE form) | front controller `public/index.php`: setelah parse request, baca `$method = strtoupper($_POST['_method'] ?? $_GET['_method'] ?? $_SERVER['REQUEST_METHOD'])` — override hanya jika request asli POST; gunakan `$method` untuk dispatch ke router |
| Flash + validasi inline | `$_SESSION['flash'] = ['errors' => [...], 'old' => [...]]` → redirect (PRG) → baca + clear di middleware awal request berikutnya → inject ke view context; template: `<?= isset($errors['name']) ? 'is-invalid' : '' ?>` + `<?= e($old['name'] ?? $user->name ?? '') ?>` |
| Kompresi / static cache | `ob_start('ob_gzhandler')` atau `zlib.output_compression = On` di `php.ini`; static files (CSS/JS/img) dilayani **langsung oleh Nginx/Apache** (bukan PHP) — PHP hanya handle route dinamis; `Cache-Control` di config Nginx/Apache untuk aset |
| File storage (OSS) | **AWS SDK PHP v3** (`aws/aws-sdk-php`) — `new S3Client([...])` + `getObjectUrl()` / `createPresignedRequest()`; validasi magic-byte: `$finfo = new \finfo(FILEINFO_MIME_TYPE); $mime = $finfo->buffer(fread($file, 16))` → whitelist; re-encode via `GD` (`imagecreatefromjpeg` → `imagejpeg`) |
| Email (SMTP) | **PHPMailer** (`phpmailer/phpmailer`) — konfigurasi SMTP dari env; template email HTML dari `src/views/mail/*.php` (render via output buffer `ob_start()`) |
| Graceful shutdown | PHP FPM: SIGTERM ditangani oleh PHP-FPM process manager; `register_shutdown_function()` untuk cleanup (tutup koneksi DB/Redis); pastikan Nginx `fastcgi_read_timeout` cukup untuk request long-running |
| Listen error fail-fast | `public/index.php`: tangkap `Exception` saat init DB/Redis/session — `error_log($e->getMessage()); http_response_code(500); echo 'Service unavailable'; exit(1)` |
| Path aset/template | semua path resolve dari `dirname(__DIR__)` (root project, bukan CWD) — `define('APP_ROOT', dirname(__DIR__))` di front controller; template: `include APP_ROOT . '/src/views/...'`; cache/upload: `APP_ROOT . '/storage/...'` |
| Test | **PHPUnit** (`phpunit/phpunit`) — unit (service), integration (repository↔DB SQLite/MySQL), HTTP (test controller via `GuzzleHttp\Client` atau custom test client); SQLite in-memory via Eloquent `['driver' => 'sqlite', 'database' => ':memory:']` untuk test cepat |
| BDD | **Behat** (`behat/behat`) — `.feature` files + `FeatureContext.php` step definitions; atau PHPUnit + data-driven test |
| Convention checker | **PHPStan** (`phpstan/phpstan`) level 8 + custom rule (service tanpa interface = error; controller akses DB langsung = error; `$_ENV`/`getenv()` di `src/Modules/` = error); **PHP_CodeSniffer** PSR-12 + custom sniff; Composer script `"check": ["phpstan analyse", "phpcs"]` + CI gate |
| /make-module | script `bin/make_module` (PHP CLI) atau Composer script: generate `src/Modules/{Modul}/` + `{Modul}Controller.php` / `{Modul}Service.php` / `I{Modul}Service.php` / `{Modul}Repository.php` / `{Modul}Module.php` dari template heredoc; tambah ke `config/modules.php` |
| Varian Full vs API-only + upgrade | env `APP_MODE=full\|api` dibaca di front controller: mode `api` = skip `session_start()`, CSRF middleware, template include, static route web; mode `full` = mount semua; `{Modul}Module::register()` cek mode sebelum daftarkan route web. Upgrade: `./bin/add_ui` — salin file view yang absent + set `APP_MODE=full` + `composer dump-autoload` + run tests |

#### Catatan tambahan PHP Native (pelajaran yang SERING terlewat)

- **`e()` helper wajib global**: definisikan di `src/helpers.php` (autoloaded via `files` di composer.json): `function e(?string $v): string { return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }`. Pakai di **setiap** `<?= ?>` untuk nilai user. `<?= $safeHtml ?>` HANYA untuk konten HTML yang sudah disanitasi di server (mis. via `HTML Purifier`).
- **Front controller = satu pintu**: `public/index.php` adalah **satu-satunya** file PHP yang diakses langsung via web server. Semua request diarahkan ke sini (Nginx `try_files $uri /index.php`). File PHP lain di `src/` tidak boleh diakses langsung. Ini cegah path traversal + akses direct ke view/config.
- **Eloquent standalone PIN tabel**: `protected $table = 'users'` eksplisit di tiap model (jangan andalan auto-pluralize Eloquent). Join table many-to-many: `belongsToMany(Role::class, 'users_roles', 'user_id', 'role_id')` — PIN nama tabel + kolom.
- **`desc` reserved word**: Eloquent query `->orderBy('desc')` aman (Eloquent auto-quote); raw query `DB::raw('ORDER BY `desc`')` perlu backtick (MySQL) atau `"desc"` (PG). Phinx migration: `$table->addColumn('desc', 'string', ...)` aman (Phinx quote per-dialek).
- **Session sebelum header**: `session_start()` harus dipanggil SEBELUM output apapun (termasuk whitespace). Gunakan `ob_start()` di awal front controller sebagai buffer, atau pastikan tidak ada output sebelum `session_start()`.
- **Multipart form + CSRF**: PHP parse multipart body untuk POST — `$_POST['_csrf']` tersedia. Untuk form DELETE via `?_method=DELETE`, `_csrf` boleh di `$_POST` (method asli masih POST). Ini berbeda dari Go (Go tidak parse body untuk DELETE setelah override).
- **OPcache di produksi**: aktifkan `opcache.enable=1` + `opcache.validate_timestamps=0` di produksi untuk performa; di dev biarkan `validate_timestamps=1` agar perubahan file terbaca.
- **Content-type**: PHP mengirim `text/html; charset=UTF-8` secara default, tapi pastikan helper `render()` set `header('Content-Type: text/html; charset=UTF-8')` eksplisit sebelum output — terutama untuk respons JSON API (`header('Content-Type: application/json')`).

---

## Catatan Penting

1. **Banyak hal jadi lebih mudah** di framework matang (Laravel/Nest/Spring/.NET/Django): DI, validasi, migration, RBAC sudah bawaan. Effort yang kita keluarkan manual di NodeAdmin sebagian **tak perlu** diulang — pakai yang native.
2. **Yang tetap harus dibuat manual** di mana pun: AGENTS.md versi target, convention checker, equivalent /make-module, theme switcher, **frontend template switcher (katalog + paginasi/search server-side + thumbnail/preview cache-klien + unduh on-demand)**, **landing publik data-driven (bind ke Setting)**, struktur modular yang disepakati.
3. **Idiom > kemiripan**: kode harus terasa natural di bahasa target. Reviewer framework itu harus menganggapnya "ditulis oleh developer {FRAMEWORK}", bukan "porting dari JS".
4. **Bertahap & terverifikasi**: fondasi → modul percontohan → guardrail → sisanya; build+test hijau tiap fase.
5. **Test = non-negotiable**: apa pun bahasanya, tiap fitur wajib test (prinsip TDD/BDD dipertahankan).
