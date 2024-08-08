import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import ScheduleController from '../http/controllers/web/v1/ScheduleController'
import { ScheduleCreateValidator } from '../http/validators/ScheduleCreateValidator'
import { ScheduleUpdateValidator } from '../http/validators/ScheduleUpdateValidator'

const router = Router()

// define route & set middleware user
const scheduleRoute = Router()

const scheduleController = new ScheduleController()
scheduleRoute.get('/admin/v1/schedule', AccessMiddleware, ensureAuthenticated, scheduleController.index.bind(scheduleController))
scheduleRoute.get('/admin/v1/schedule/create', AccessMiddleware, ensureAuthenticated, scheduleController.create.bind(scheduleController))
scheduleRoute.post('/admin/v1/schedule/store', AccessMiddleware, ensureAuthenticated, ScheduleCreateValidator, scheduleController.store.bind(scheduleController))
scheduleRoute.get('/admin/v1/schedule/:id/edit', AccessMiddleware, ensureAuthenticated, scheduleController.edit.bind(scheduleController))
scheduleRoute.put('/admin/v1/schedule/:id/update', AccessMiddleware, ensureAuthenticated, ScheduleUpdateValidator, scheduleController.update.bind(scheduleController))
scheduleRoute.get('/admin/v1/schedule/:id/delete', AccessMiddleware, ensureAuthenticated, scheduleController.delete.bind(scheduleController))
scheduleRoute.post('/admin/v1/schedule/delete_selected', AccessMiddleware, ensureAuthenticated, scheduleController.delete_selected.bind(scheduleController))

router.use(scheduleRoute)

export default router