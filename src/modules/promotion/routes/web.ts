import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import PromotionController from '../http/controllers/web/v1/PromotionController'
import { PromotionCreateValidator } from '../http/validators/PromotionCreateValidator'
import { PromotionUpdateValidator } from '../http/validators/PromotionUpdateValidator'
import PromotionInstitutionController from '../http/controllers/web/v1/PromotionInstitutionController'

const router = Router()

// define route & set middleware promotion
const promotionRoute = Router()
const promotionController = new PromotionController()
const promotionInstitutionController = new PromotionInstitutionController()
promotionRoute.get('/admin/v1/promotion', AccessMiddleware, ensureAuthenticated, promotionController.index.bind(promotionController))
promotionRoute.get('/admin/v1/promotion/generate_code', AccessMiddleware, ensureAuthenticated, promotionController.generate_code.bind(promotionController))
promotionRoute.get('/admin/v1/promotion/create', AccessMiddleware, ensureAuthenticated, promotionController.create.bind(promotionController))
promotionRoute.post('/admin/v1/promotion/store', AccessMiddleware, ensureAuthenticated, PromotionCreateValidator, promotionController.store.bind(promotionController))
promotionRoute.get('/admin/v1/promotion/:id/edit', AccessMiddleware, ensureAuthenticated, promotionController.edit.bind(promotionController))
promotionRoute.put('/admin/v1/promotion/:id/update', AccessMiddleware, ensureAuthenticated, PromotionUpdateValidator, promotionController.update.bind(promotionController))
promotionRoute.get('/admin/v1/promotion/:id/delete', AccessMiddleware, ensureAuthenticated, promotionController.delete.bind(promotionController))
promotionRoute.post('/admin/v1/promotion/delete_selected', AccessMiddleware, ensureAuthenticated, promotionController.delete_selected.bind(promotionController))

promotionRoute.get('/admin/v1/promotion/:id/institution', AccessMiddleware, ensureAuthenticated, promotionInstitutionController.index.bind(promotionInstitutionController))
promotionRoute.get('/admin/v1/promotion/:id/institution/create', AccessMiddleware, ensureAuthenticated, promotionInstitutionController.create.bind(promotionInstitutionController))
promotionRoute.post('/admin/v1/promotion/:id/institution/store', AccessMiddleware, ensureAuthenticated, promotionInstitutionController.store.bind(promotionInstitutionController))
promotionRoute.get('/admin/v1/promotion/:id/institution/:institution_id/delete', AccessMiddleware, ensureAuthenticated, promotionInstitutionController.delete.bind(promotionInstitutionController))
promotionRoute.post('/admin/v1/promotion/:id/institution/delete_selected', AccessMiddleware, ensureAuthenticated, promotionInstitutionController.delete_selected.bind(promotionInstitutionController))

router.use(promotionRoute)

export default router