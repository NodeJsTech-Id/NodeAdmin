# @flazhost-nodeadmin/cli

## 1.1.2

### Patch Changes

- Longgarkan peer dependency typeorm (`^0.3.20` → `>=0.3.20`) dan jadikan optional. CLI hanya shell-out `npx typeorm` di `make-migration`, sehingga tak perlu mengunci mayor — memperbaiki konflik ERESOLVE saat app turunan memakai typeorm 1.x.

## 1.1.1

### Patch Changes

- Tambah README per-paket (cara install, penggunaan, daftar export/command) agar tampil di halaman npm.

## 1.1.0

### Minor Changes

- 3b9db06: Rilis awal pabrik berversi: ekstrak runtime generik ke `@flazhost-nodeadmin/core` (AppError, date/timezones, namedRoutes, functions, themes, csrf, ResponseHandler, errorHandler, rateLimiter, routeBinding/handler, renderView+configureViewPaths, makeEnvHelpers, createDataSource, registerRepository, createApp) dan tooling ke `@flazhost-nodeadmin/cli` (`nodeadmin check | copy-views | make-migration`).
