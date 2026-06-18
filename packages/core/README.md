# @flazhost-nodeadmin/core

Runtime generik [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) — DI/container, error handling, render view, helpers, routing, dan bootstrap aplikasi. Dipakai oleh app turunan agar dapat menarik update via versi tanpa menyalin ulang kode.

## Instalasi

```bash
npm install @flazhost-nodeadmin/core
```

Peer: `express`, `typeorm`, `tsyringe` (terpasang di app turunan).

## Quick Start

> ⚠️ **Wajib:** `import 'reflect-metadata'` di baris paling atas entry point (sebelum import apa pun dari core). Tanpa ini tsyringe/DI gagal: `tsyringe requires a reflect polyfill`.
>
> ℹ️ **`errorHandler` membedakan API vs web:** request berpath `/api/*` → respons JSON via `ResponseHandler`; selain itu → flash + redirect. Untuk endpoint JSON, beri prefix `/api/`.

```js
import 'reflect-metadata'           // WAJIB, paling atas
import express from 'express'
import { EntitySchema } from 'typeorm'
import {
  createDataSource, ResponseHandler, AppError, NotFoundError, errorHandler, paginate,
} from '@flazhost-nodeadmin/core'

const Product = new EntitySchema({
  name: 'Product',
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    price: { type: Number },
  },
})

const ds = createDataSource({ type: 'better-sqlite3', database: ':memory:', synchronize: true, entities: [Product] })
await ds.initialize()
const repo = ds.getRepository('Product')

const app = express()
app.use(express.json())

// LIST — paginate() menerima QueryBuilder + { page, page_size }
app.get('/api/products', async (req, res, next) => {
  try {
    const qb = repo.createQueryBuilder('p')
    const result = await paginate(qb, { page: req.query.page, page_size: req.query.page_size })
    ResponseHandler.success(res, 'Daftar produk', result)
  } catch (e) { next(e) }
})

// GET — NotFoundError → 404 JSON via errorHandler
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const p = await repo.findOneBy({ id: Number(req.params.id) })
    if (!p) throw new NotFoundError('Produk tidak ditemukan')
    ResponseHandler.success(res, 'Detail produk', p)
  } catch (e) { next(e) }
})

// CREATE — AppError(422) → 422 JSON
app.post('/api/products', async (req, res, next) => {
  try {
    if (!req.body.name) throw new AppError('Nama wajib diisi', 422)
    const saved = await repo.save(req.body)
    ResponseHandler.success(res, 'Produk dibuat', saved, 201)
  } catch (e) { next(e) }
})

app.use(errorHandler)               // daftarkan TERAKHIR
app.listen(3000)
```

Respons konsisten `{ status, message, data }`; error otomatis terformat sesuai `statusCode` dari `AppError`.

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
