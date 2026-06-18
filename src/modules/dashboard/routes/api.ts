import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import DashboardController from '../http/controllers/api/v1/DashboardController'
import { handler } from '../../../utils/routeBinding'

const router = Router()
const dashboardRoute = named.extendRouter(Router())

dashboardRoute.get('api.v1.dashboard.index', '/api/v1/dashboard', ensureAuthenticatedApi, AccessMiddleware, handler(DashboardController, 'index'))

router.use(dashboardRoute)

export default router
