import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import ProfessionController from '../http/controllers/web/v1/ProfessionController'
import { ProfessionCreateValidator } from '../http/validators/ProfessionCreateValidator'
import { ProfessionUpdateValidator } from '../http/validators/ProfessionUpdateValidator'

const router = Router()

// define route & set middleware user
const professionRoute = Router()

const professionController = new ProfessionController()
professionRoute.get('/admin/v1/profession', AccessMiddleware, ensureAuthenticated, professionController.index.bind(professionController))
professionRoute.get('/admin/v1/profession/create', AccessMiddleware, ensureAuthenticated, professionController.create.bind(professionController))
professionRoute.post('/admin/v1/profession/store', AccessMiddleware, ensureAuthenticated, ProfessionCreateValidator, professionController.store.bind(professionController))
professionRoute.get('/admin/v1/profession/:id/edit', AccessMiddleware, ensureAuthenticated, professionController.edit.bind(professionController))
professionRoute.put('/admin/v1/profession/:id/update', AccessMiddleware, ensureAuthenticated, ProfessionUpdateValidator, professionController.update.bind(professionController))
professionRoute.get('/admin/v1/profession/:id/delete', AccessMiddleware, ensureAuthenticated, professionController.delete.bind(professionController))
professionRoute.post('/admin/v1/profession/delete_selected', AccessMiddleware, ensureAuthenticated, professionController.delete_selected.bind(professionController))

router.use(professionRoute)

export default router