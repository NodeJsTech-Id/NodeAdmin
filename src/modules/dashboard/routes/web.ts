import { Router } from 'express'
import DashboardController from '../http/controllers/web/v1/DashboardController'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'

const router = Router()

// define route & set middleware
const dashboardRoute = Router()
const dashboardController = new DashboardController()
dashboardRoute.get('/admin/v1/dashboard', ensureAuthenticated, AccessMiddleware, dashboardController.index.bind(dashboardController))

router.use(dashboardRoute)

export default router
