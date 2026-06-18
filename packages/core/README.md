# @flazhost-nodeadmin/core

Runtime generik [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) — DI/container, error handling, render view, helpers, routing, dan bootstrap aplikasi. Dipakai oleh app turunan agar dapat menarik update via versi tanpa menyalin ulang kode.

## Instalasi

```bash
npm install @flazhost-nodeadmin/core
```

Peer: `express`, `typeorm`, `tsyringe` (terpasang di app turunan).

## Penggunaan

```ts
import {
  createApp,
  createDataSource,
  registerRepository,
  AppError,
  NotFoundError,
  ConflictError,
  renderView,
  configureViewPaths,
  handler,
  namedRoutes,
  ResponseHandler,
  errorHandler,
  authLimiter,
  otpLimiter,
  makeEnvHelpers,
  Functions,        // paginate, ciLike, removePrefix
  getTheme,
  THEMES,
} from '@flazhost-nodeadmin/core'
```

### Yang disediakan

| Area | Export |
|------|--------|
| Bootstrap app | `createApp`, `configureViewPaths` |
| Database | `createDataSource`, `registerRepository`, `assertInit` |
| Error | `AppError`, `NotFoundError`, `ConflictError`, `errorHandler` |
| Render web | `renderView` |
| Routing | `handler`, `namedRoutes` |
| Response API | `ResponseHandler` |
| Helpers | `Functions` (`paginate`, `ciLike`, `removePrefix`), date/timezones |
| Security | `authLimiter`, `otpLimiter`, csrf |
| Env | `makeEnvHelpers` |
| Themes | `getTheme`, `THEMES`, `THEME_NAMES`, `DEFAULT_THEME` |

## Prinsip

- Service `throw AppError` (bukan `return error`); `errorHandler` memformat respons terpusat.
- Render web via `renderView()`; route via `handler(Ctrl, 'method')`.
- DI via tsyringe — service/controller `@injectable`, di-inject.

Detail arsitektur & konvensi: lihat repo [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) (`AGENTS.md`).

## Lisensi

MIT
