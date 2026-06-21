# @flazhost-nodeadmin/cli

## 1.2.2

### Patch Changes

- `add-ui` menarik `template-v1.0.12` (berisi perbaikan JWT logout blacklist). Tanpa perubahan perilaku command.

## 1.2.1

### Patch Changes

- Naikkan `giget` `^1.2.3` → `^3.3.0` untuk menghapus **3 audit high** (node-tar path-traversal) yang masuk lewat `giget@1.x` (bawa `tar@^6` rentan; fix hanya di `tar@7`, dan `giget@3` melepas dependency `tar` sepenuhnya). `giget@3` ESM-only → pemanggilan diganti `await import('giget')` (call-site sudah async). Tanpa perubahan perilaku `add-ui`.

## 1.2.0

### Minor Changes

- Tambah command **`nodeadmin add-ui`** — upgrade install **API-only** → **Full (UI + REST API)** tanpa scaffold ulang. Mengunduh lapisan UI (aset `public/`, layout, modul `home`/`components`/`media`, route/controller/view web, test UI), menyalin **hanya file yang absent** (diff full↔api kini purely-additive — file shared identik, varian dipilih runtime via `APP_MODE`), menimpa stub test (`access.user`/`auth`) ke versi full, merge deps & script UI ke `package.json`, set `APP_MODE=full` di `.env`, lalu verifikasi (`install` → `check` → `tsc` → `test`). Idempotent. Override dev/test via env `NODEADMIN_TEMPLATE_DIR`. Menambah dependency `giget`.

## 1.1.3

### Patch Changes

- README dialihbahasakan ke **Inggris** (instalasi, tabel command, contoh). Tanpa perubahan perilaku CLI.

## 1.1.2

### Patch Changes

- Longgarkan peer dependency typeorm (`^0.3.20` → `>=0.3.20`) dan jadikan optional. CLI hanya shell-out `npx typeorm` di `make-migration`, sehingga tak perlu mengunci mayor — memperbaiki konflik ERESOLVE saat app turunan memakai typeorm 1.x.

## 1.1.1

### Patch Changes

- Tambah README per-paket (cara install, penggunaan, daftar export/command) agar tampil di halaman npm.

## 1.1.0

### Minor Changes

- 3b9db06: Rilis awal pabrik berversi: ekstrak runtime generik ke `@flazhost-nodeadmin/core` (AppError, date/timezones, namedRoutes, functions, themes, csrf, ResponseHandler, errorHandler, rateLimiter, routeBinding/handler, renderView+configureViewPaths, makeEnvHelpers, createDataSource, registerRepository, createApp) dan tooling ke `@flazhost-nodeadmin/cli` (`nodeadmin check | copy-views | make-migration`).
