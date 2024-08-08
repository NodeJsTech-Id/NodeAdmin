import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import InstitutionController from '../http/controllers/web/v1/InstitutionController'
import { InstitutionCreateValidator } from '../http/validators/InstitutionCreateValidator'
import { InstitutionUpdateValidator } from '../http/validators/InstitutionUpdateValidator'
import InstitutionUserController from '../http/controllers/web/v1/InstitutionUserController'
import { InstitutionUserCreateValidator } from '../http/validators/InstitutionUserCreateValidator'
import { InstitutionUserUpdateValidator } from '../http/validators/InstitutionUserUpdateValidator'
import InstitutionPartnerController from '../http/controllers/web/v1/InstitutionPartnerController'
import InstitutionPartnerUserController from '../http/controllers/web/v1/InstitutionPartnerUserController'

const router = Router()

// define route & set middleware user
const institutionRoute = Router()
const institutionController = new InstitutionController()
institutionRoute.get('/admin/v1/institution', AccessMiddleware, ensureAuthenticated, institutionController.index.bind(institutionController))
institutionRoute.get('/admin/v1/institution/generate_refferal', AccessMiddleware, ensureAuthenticated, institutionController.generate_refferal.bind(institutionController))
institutionRoute.get('/admin/v1/institution/create', AccessMiddleware, ensureAuthenticated, institutionController.create.bind(institutionController))
institutionRoute.post('/admin/v1/institution/store', AccessMiddleware, ensureAuthenticated, InstitutionCreateValidator, institutionController.store.bind(institutionController))
institutionRoute.get('/admin/v1/institution/:id/promotion', AccessMiddleware, ensureAuthenticated, institutionController.promotion.bind(institutionController))
institutionRoute.get('/admin/v1/institution/:id/edit', AccessMiddleware, ensureAuthenticated, institutionController.edit.bind(institutionController))
institutionRoute.put('/admin/v1/institution/:id/update', AccessMiddleware, ensureAuthenticated, InstitutionUpdateValidator, institutionController.update.bind(institutionController))
institutionRoute.get('/admin/v1/institution/:id/delete', AccessMiddleware, ensureAuthenticated, institutionController.delete.bind(institutionController))
institutionRoute.post('/admin/v1/institution/delete_selected', AccessMiddleware, ensureAuthenticated, institutionController.delete_selected.bind(institutionController))

const institutionUserController = new InstitutionUserController()
institutionRoute.get('/admin/v1/institution/:institution_id/user', AccessMiddleware, ensureAuthenticated, institutionUserController.index.bind(institutionUserController))
institutionRoute.get('/admin/v1/institution/:institution_id/user/create', AccessMiddleware, ensureAuthenticated, institutionUserController.create.bind(institutionUserController))
institutionRoute.post('/admin/v1/institution/:institution_id/user/store', AccessMiddleware, ensureAuthenticated, InstitutionUserCreateValidator, institutionUserController.store.bind(institutionUserController))
institutionRoute.get('/admin/v1/institution/:institution_id/user/:id/edit', AccessMiddleware, ensureAuthenticated, institutionUserController.edit.bind(institutionUserController))
institutionRoute.put('/admin/v1/institution/:institution_id/user/:id/update', AccessMiddleware, ensureAuthenticated, InstitutionUserUpdateValidator, institutionUserController.update.bind(institutionUserController))
institutionRoute.get('/admin/v1/institution/:institution_id/user/:id/delete', AccessMiddleware, ensureAuthenticated, institutionUserController.delete.bind(institutionUserController))
institutionRoute.post('/admin/v1/institution/:institution_id/user/delete_selected', AccessMiddleware, ensureAuthenticated, institutionUserController.delete_selected.bind(institutionUserController))

const institutionPartnerRoute = Router()
const institutionPartnerController = new InstitutionPartnerController()
institutionPartnerRoute.get('/admin/v1/institution/partner', AccessMiddleware, ensureAuthenticated, institutionPartnerController.index.bind(institutionPartnerController))
institutionPartnerRoute.get('/admin/v1/institution/partner/generate_refferal', AccessMiddleware, ensureAuthenticated, institutionPartnerController.generate_refferal.bind(institutionPartnerController))
institutionPartnerRoute.get('/admin/v1/institution/partner/:id/promotion', AccessMiddleware, ensureAuthenticated, institutionPartnerController.promotion.bind(institutionPartnerController))
institutionPartnerRoute.get('/admin/v1/institution/partner/:id/edit', AccessMiddleware, ensureAuthenticated, institutionPartnerController.edit.bind(institutionPartnerController))
institutionPartnerRoute.put('/admin/v1/institution/partner/:id/update', AccessMiddleware, ensureAuthenticated, InstitutionUpdateValidator, institutionPartnerController.update.bind(institutionPartnerController))

const institutionPartnerUserController = new InstitutionPartnerUserController()
institutionPartnerRoute.get('/admin/v1/institution/partner/:institution_id/user', AccessMiddleware, ensureAuthenticated, institutionPartnerUserController.index.bind(institutionPartnerUserController))
institutionPartnerRoute.get('/admin/v1/institution/partner/:institution_id/user/create', AccessMiddleware, ensureAuthenticated, institutionPartnerUserController.create.bind(institutionPartnerUserController))
institutionPartnerRoute.post('/admin/v1/institution/partner/:institution_id/user/store', AccessMiddleware, ensureAuthenticated, InstitutionUserCreateValidator, institutionPartnerUserController.store.bind(institutionPartnerUserController))
institutionPartnerRoute.get('/admin/v1/institution/partner/:institution_id/user/:id/edit', AccessMiddleware, ensureAuthenticated, institutionPartnerUserController.edit.bind(institutionPartnerUserController))
institutionPartnerRoute.put('/admin/v1/institution/partner/:institution_id/user/:id/update', AccessMiddleware, ensureAuthenticated, InstitutionUserUpdateValidator, institutionPartnerUserController.update.bind(institutionPartnerUserController))
institutionPartnerRoute.get('/admin/v1/institution/partner/:institution_id/user/:id/delete', AccessMiddleware, ensureAuthenticated, institutionPartnerUserController.delete.bind(institutionPartnerUserController))
institutionPartnerRoute.post('/admin/v1/institution/partner/:institution_id/user/delete_selected', AccessMiddleware, ensureAuthenticated, institutionPartnerUserController.delete_selected.bind(institutionPartnerUserController))

router.use(institutionRoute,institutionPartnerRoute)

export default router