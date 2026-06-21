# @flazhost-nodeadmin/core

Generic runtime for [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) — DI/container, error handling, view rendering, helpers, routing, and app bootstrap. Used by derived apps so they can pull updates via versioning without copying code again.

## Installation

```bash
npm install @flazhost-nodeadmin/core
```

Peers: `express`, `typeorm`, `tsyringe` (installed in the derived app).

## Quick Start

> ⚠️ **Required:** `import 'reflect-metadata'` at the very top of the entry point (before any import from core). Without it, tsyringe/DI fails: `tsyringe requires a reflect polyfill`.
>
> ℹ️ **`errorHandler` distinguishes API from web:** requests with a `/api/*` path → JSON response via `ResponseHandler`; otherwise → flash + redirect. For JSON endpoints, use the `/api/` prefix.

```js
import 'reflect-metadata'           // REQUIRED, very top
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

// LIST — paginate() takes a QueryBuilder + { page, page_size }
app.get('/api/products', async (req, res, next) => {
  try {
    const qb = repo.createQueryBuilder('p')
    const result = await paginate(qb, { page: req.query.page, page_size: req.query.page_size })
    ResponseHandler.success(res, 'Product list', result)
  } catch (e) { next(e) }
})

// GET — NotFoundError → 404 JSON via errorHandler
app.get('/api/products/:id', async (req, res, next) => {
  try {
    const p = await repo.findOneBy({ id: Number(req.params.id) })
    if (!p) throw new NotFoundError('Product not found')
    ResponseHandler.success(res, 'Product detail', p)
  } catch (e) { next(e) }
})

// CREATE — AppError(422) → 422 JSON
app.post('/api/products', async (req, res, next) => {
  try {
    if (!req.body.name) throw new AppError('Name is required', 422)
    const saved = await repo.save(req.body)
    ResponseHandler.success(res, 'Product created', saved, 201)
  } catch (e) { next(e) }
})

app.use(errorHandler)               // register LAST
app.listen(3000)
```

Consistent `{ status, message, data }` responses; errors are automatically formatted from the `statusCode` of `AppError`.

## Usage

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

### What it provides

| Area | Export |
|------|--------|
| App bootstrap | `createApp`, `configureViewPaths` |
| Database | `createDataSource`, `registerRepository`, `assertInit` |
| Error | `AppError`, `NotFoundError`, `ConflictError`, `errorHandler` |
| Web render | `renderView` |
| Routing | `handler`, `namedRoutes` |
| API response | `ResponseHandler` |
| Helpers | `Functions` (`paginate`, `ciLike`, `removePrefix`), date/timezones |
| Security | `authLimiter`, `otpLimiter`, csrf |
| Env | `makeEnvHelpers` |
| Themes | `getTheme`, `THEMES`, `THEME_NAMES`, `DEFAULT_THEME` |

## Principles

- Services `throw AppError` (not `return error`); `errorHandler` formats the response centrally.
- Web render via `renderView()`; routing via `handler(Ctrl, 'method')`.
- DI via tsyringe — services/controllers are `@injectable` and injected.

Architecture & convention details: see the [NodeAdmin](https://github.com/NodeJsTech-Id/NodeAdmin) repo (`AGENTS.md`).

## License

MIT
