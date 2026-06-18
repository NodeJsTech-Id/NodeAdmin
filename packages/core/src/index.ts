// Barrel publik @flazhost-nodeadmin/core — permukaan API runtime generik.
// Phase 1: Tier 0 (zero-dep). Bertambah seiring ekstraksi.

// Errors
export * from './errors/AppError'

// Utils
export * from './utils/date'
export * from './utils/timezones'
export { default as namedRoutes } from './utils/namedRoutes'
export type { NamedRouterMethods } from './utils/namedRoutes'

export { handler } from './utils/routeBinding'
export { renderView, configureViewPaths } from './utils/view'
export type { ViewPathsConfig } from './utils/view'

// Helpers (Function class = default → diekspos sebagai named `Functions`)
export { default as Functions, removePrefix, ciLike, paginate } from './helpers/functions'
export type { PaginateResult } from './helpers/functions'

// Config
export * from './config/themes'
export { makeEnvHelpers } from './config/envHelpers'
export type { EnvHelpers } from './config/envHelpers'
export { createDataSource } from './config/dataSource'
export type { DataSourceConfig } from './config/dataSource'

// DI helpers
export { assertInit, registerRepository } from './container'

// App factory
export { createApp } from './createApp'
export type { CreateAppOptions } from './createApp'

// Response (default class → named `ResponseHandler`)
export { default as ResponseHandler } from './ResponseHandler'

// Middleware
export * from './middleware/csrf'
export { errorHandler } from './middleware/errorHandler'
export { authLimiter, otpLimiter } from './middleware/rateLimiter'
