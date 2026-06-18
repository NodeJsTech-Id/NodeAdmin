# @flazhost-nodeadmin/core

## 1.1.2

### Patch Changes

- Tambah section Quick Start di README core (contoh app Express+TypeORM end-to-end, catatan wajib `reflect-metadata`, dan perilaku errorHandler API vs web).

## 1.1.1

### Patch Changes

- Tambah README per-paket (cara install, penggunaan, daftar export/command) agar tampil di halaman npm.

## 1.1.0

### Minor Changes

- 3b9db06: Rilis awal pabrik berversi: ekstrak runtime generik ke `@flazhost-nodeadmin/core` (AppError, date/timezones, namedRoutes, functions, themes, csrf, ResponseHandler, errorHandler, rateLimiter, routeBinding/handler, renderView+configureViewPaths, makeEnvHelpers, createDataSource, registerRepository, createApp) dan tooling ke `@flazhost-nodeadmin/cli` (`nodeadmin check | copy-views | make-migration`).
