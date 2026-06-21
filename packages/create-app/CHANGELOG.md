# @flazhost-nodeadmin/create-app

## 1.0.16

### Patch Changes

- Tarik `template-v1.0.11`: diff varian **full↔api** kini **purely-additive** (file shared identik byte-for-byte; varian dipilih runtime via env `APP_MODE`). Entry tunggal `src/index.ts` menggantikan `index.api.ts` lama. Membuka jalur upgrade **API-only → +UI** lewat `nodeadmin add-ui` (butuh `@flazhost-nodeadmin/cli` ≥ 1.2.0).

## 1.0.15

### Patch Changes

- Tarik `template-v1.0.10`: perbaiki app "mati senyap" / "Gagal memuat preview" saat fresh install (dev). Sumbernya **nodemon restart-loop** — penulisan cache `public/fe/templates/_catalog.json` memicu nodemon me-restart server di tengah request. Tambah `nodemon.json` (watch `src` saja, ignore folder cache). Plus `server.on('error')` untuk EADDRINUSE (pesan jelas, tak mati mendadak) & timeout fetch katalog dilonggarkan ke 20s.

## 1.0.14

### Patch Changes

- Tarik `template-v1.0.9`: preview frontend template lebih tahan-banting — cache lokal dilayani lebih dulu, fetch upstream diberi **timeout 8s** (`AbortSignal`), dan fallback ke cache lokal saat GitHub gagal/lambat (perbaiki "Gagal memuat preview" saat koneksi terputus / proxy timeout).

## 1.0.13

### Patch Changes

- Tarik `template-v1.0.8`: modul/route `landing` → **`home`** (halaman publik `/` me-render home LANGSUNG tanpa redirect; `/home` alias; login eksplisit di `/auth/login`). README app turunan dialihbahasakan ke **Inggris**. Plus perbaikan import yatim `FeCatalogService` di varian API-only (template-api kini buildable).

## 1.0.12

### Patch Changes

- Tarik `template-v1.0.7`: upgrade **nodemailer 6 → 9** (memperbaiki 1 kerentanan HIGH: SMTP command injection / DoS / TLS). Audit app turunan: 0 high (sisa moderate hanya devDependency `js-yaml` via jest, tak ke production).

## 1.0.11

### Patch Changes

- README npm: dokumentasikan pilihan varian **Full / API only** (prompt + flag `--api`) dan anjuran `@latest` agar npx tak memakai cache lama. (Hanya dokumentasi; fungsionalitas varian sudah ada sejak 1.0.9.)

## 1.0.10

### Patch Changes

- Tarik `template-v1.0.6`: perbaikan migration fresh-install (`InitSetting` gagal `table settings has no column named fe_template`) — seed via raw query agar lepas dari metadata entity. Plus fitur frontend template switcher (katalog 640 + paginasi/search + preview) & landing data-driven ikut di template.

## 1.0.9

### Patch Changes

- Tambah opsi API-only pada scaffolder: `npm create @flazhost-nodeadmin/app myapp --api` (atau prompt pilih) menghasilkan app REST-only tanpa UI. Core `createApp` dukung `mode: 'all' | 'api'` (default 'all', backward-compatible). Plus housekeeping deps (uuid@11, typeorm 0.3.30, better-sqlite3 12, hapus @types stub).

## 1.0.8

### Patch Changes

- Arahkan ke template-v1.0.4 (better-sqlite3 ^12 dgn prebuilt Node 22 → install cepat tanpa compile).

## 1.0.7

### Patch Changes

- Tambah section Tampilan (screenshot UI) di README create-app.

## 1.0.6

### Patch Changes

- README create-app lebih lengkap: badge, tabel fitur, mulai cepat, ganti DB, prasyarat, tautan.

## 1.0.5

### Patch Changes

- Arahkan ke template-v1.0.3 (README app turunan kini lengkap, bukan ringkas).

## 1.0.4

### Patch Changes

- Uji ulang rantai rilis otomatis (CI → mirror → release.yml → npm) dengan NPM_TOKEN baru.

## 1.0.3

### Patch Changes

- Uji rantai rilis otomatis (CI → mirror → release.yml → npm). Tanpa perubahan fungsional.

## 1.0.2

### Patch Changes

- Arahkan sumber template ke repo bersih `FlazHost-Com/NodeAdmin` (tanpa materi porting/spec bahasa lain) dan template-v1.0.2.
