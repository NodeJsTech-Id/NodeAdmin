import type { Application, Router, RequestHandler } from 'express'
import type { RequestHandlerParams, PathParams } from 'express-serve-static-core'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'all'

const registry = new Map<string, string>()
type RouteRecord = { name: string; path: string; method: HttpMethod }
const records: RouteRecord[] = []
const byPathMethod = new Map<string, string>() // key: "METHOD path" → name

function buildUrl(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const val = params[key]
    if (val === undefined || val === null) {
      throw new Error(`Missing param '${key}' for route`)
    }
    return encodeURIComponent(String(val))
  })
}

class NamedRouter {
  extendExpress(app: Application) {
    // expose builder and current routes on app
    ;(app as any).namedRoutes = {
      build: (name: string, params?: Record<string, string | number>) => {
        const template = registry.get(name)
        if (!template) throw new Error(`Unknown route: ${name}`)
        return buildUrl(template, params || {})
      },
      routes: Object.create(null) as Record<string, string>,
    }

    // keep app.namedRoutes.routes in sync
    const syncRoutes = () => {
      const routesObj: Record<string, string> = {}
      for (const [k, v] of registry.entries()) routesObj[k] = v
      ;(app as any).namedRoutes.routes = routesObj
    }

    // initial sync
    syncRoutes()

    // patch registry.set to also sync
    const origSet = registry.set.bind(registry)
    ;(registry as any).set = (key: string, value: string) => {
      const r = origSet(key, value)
      syncRoutes()
      return r
    }
  }

  // Return the router with extended method overloads so callers can assign it
  extendRouter<R extends Router>(router: R): R & NamedRouterMethods {
    const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all']
    for (const method of methods) {
      const original = (router as any)[method].bind(router)
      ;(router as any)[method] = (...args: any[]) => {
        // Supports: router.get(name, path, ...handlers) OR router.get(path, ...handlers)
        if (typeof args[0] === 'string' && typeof args[1] === 'string') {
          const [name, path, ...handlers] = args as [string, string, ...RequestHandler[]]
          registry.set(name, path)
          records.push({ name, path, method })
          const key = `${method.toUpperCase()} ${path}`
          byPathMethod.set(key, name)
          return original(path, ...handlers)
        }
        return original(...args)
      }
    }
    return router as R & NamedRouterMethods
  }

  // Resolve a named route's path
  getPathByName(name: string): string | undefined {
    return registry.get(name)
  }

  // Resolve a route name from a path and method
  getNameByPathAndMethod(path: string, method: string): string | undefined {
    const upper = method.toUpperCase()
    return byPathMethod.get(`${upper} ${path}`) || byPathMethod.get(`ALL ${path}`)
  }
}

export default new NamedRouter()

// Type helpers for the extended router methods. After calling extendRouter(router),
// the variable is narrowed to include these overloads.
export type NamedRouterMethods = {
  [M in HttpMethod]: (
    name: string,
    path: PathParams,
    ...handlers: RequestHandlerParams[]
  ) => Router
}
