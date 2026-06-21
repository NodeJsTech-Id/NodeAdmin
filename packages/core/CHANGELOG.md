# @flazhost-nodeadmin/core

## 1.3.0

### Minor Changes

- Buang dependency `connect-flash@0.1.1` (tak terawat sejak 2014, memicu `DEP0044 util.isArray`). Diganti middleware flash inline (`Array.isArray` + augmentasi tipe `Request.flash`) — API kompatibel, perilaku sama. Menghilangkan deprecation runtime di app turunan tanpa perubahan cara pakai.

## 1.2.1

### Patch Changes

- README dialihbahasakan ke **Inggris** (Quick Start, daftar export, prinsip). Tanpa perubahan API/runtime.

## 1.2.0

### Minor Changes

- Tambah opsi API-only pada scaffolder: `npm create @flazhost-nodeadmin/app myapp --api` (atau prompt pilih) menghasilkan app REST-only tanpa UI. Core `createApp` dukung `mode: 'all' | 'api'` (default 'all', backward-compatible). Plus housekeeping deps (uuid@11, typeorm 0.3.30, better-sqlite3 12, hapus @types stub).

## 1.1.2

### Patch Changes

- Tambah section Quick Start di README core (contoh app Express+TypeORM end-to-end, catatan wajib `reflect-metadata`, dan perilaku errorHandler API vs web).

## 1.1.1

### Patch Changes

- Tambah README per-paket (cara install, penggunaan, daftar export/command) agar tampil di halaman npm.

## 1.1.0

### Minor Changes

- 3b9db06: Rilis awal pabrik berversi: ekstrak runtime generik ke `@flazhost-nodeadmin/core` (AppError, date/timezones, namedRoutes, functions, themes, csrf, ResponseHandler, errorHandler, rateLimiter, routeBinding/handler, renderView+configureViewPaths, makeEnvHelpers, createDataSource, registerRepository, createApp) dan tooling ke `@flazhost-nodeadmin/cli` (`nodeadmin check | copy-views | make-migration`).
