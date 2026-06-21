import { Router } from 'express'
import { namedRoutes as named } from '@flazhost-nodeadmin/core'
import LandingController from '../http/controllers/web/v1/LandingController'
import { handler } from '@flazhost-nodeadmin/core'

const router = Router()
const landingRoute = named.extendRouter(Router())

// Landing publik (tanpa auth). Root '/' juga merender ini via rootHandler
// (src/index.ts); '/landing' adalah alias eksplisit yang dapat di-link.
landingRoute.get('web.landing.index', '/landing', handler(LandingController, 'index'))

router.use(landingRoute)

export default router
