import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import SubjectController from '../http/controllers/web/v1/SubjectController'
import { SubjectCreateValidator } from '../http/validators/SubjectCreateValidator'
import { SubjectUpdateValidator } from '../http/validators/SubjectUpdateValidator'
import { SubjectSubCreateValidator } from '../http/validators/SubjectSubCreateValidator'
import { SubjectSubUpdateValidator } from '../http/validators/SubjectSubUpdateValidator'
import SubjectSubController from '../http/controllers/web/v1/SubjectSubController'
import SubjectSubDetailController from '../http/controllers/web/v1/SubjectSubDetailController'
import { SubjectSubDetailCreateValidator } from '../http/validators/SubjectSubDetailCreateValidator'
import { SubjectSubDetailUpdateValidator } from '../http/validators/SubjectSubDetailUpdateValidator'
import SubjectSubDetailContentController from '../http/controllers/web/v1/SubjectSubDetailContentController'
import { SubjectSubDetailContentCreateValidator } from '../http/validators/SubjectSubDetailContentCreateValidator'
import { SubjectSubDetailContentUpdateValidator } from '../http/validators/SubjectSubDetailContentUpdateValidator'

const router = Router()

// define route & set middleware user
const subjectRoute = Router()
const subjectController = new SubjectController()
subjectRoute.get('/admin/v1/subject', AccessMiddleware, ensureAuthenticated, subjectController.index.bind(subjectController))
subjectRoute.get('/admin/v1/subject/create', AccessMiddleware, ensureAuthenticated, subjectController.create.bind(subjectController))
subjectRoute.post('/admin/v1/subject/store', AccessMiddleware, ensureAuthenticated, SubjectCreateValidator, subjectController.store.bind(subjectController))
subjectRoute.get('/admin/v1/subject/:id/edit', AccessMiddleware, ensureAuthenticated, subjectController.edit.bind(subjectController))
subjectRoute.put('/admin/v1/subject/:id/update', AccessMiddleware, ensureAuthenticated, SubjectUpdateValidator, subjectController.update.bind(subjectController))
subjectRoute.get('/admin/v1/subject/:id/delete', AccessMiddleware, ensureAuthenticated, subjectController.delete.bind(subjectController))
subjectRoute.post('/admin/v1/subject/delete_selected', AccessMiddleware, ensureAuthenticated, subjectController.delete_selected.bind(subjectController))

const subjectSubRoute = Router()
const subjectSubController = new SubjectSubController()
subjectSubRoute.get('/admin/v1/subject_sub', AccessMiddleware, ensureAuthenticated, subjectSubController.index.bind(subjectSubController))
subjectSubRoute.get('/admin/v1/subject_sub/create', AccessMiddleware, ensureAuthenticated, subjectSubController.create.bind(subjectSubController))
subjectSubRoute.post('/admin/v1/subject_sub/store', AccessMiddleware, ensureAuthenticated, SubjectSubCreateValidator, subjectSubController.store.bind(subjectSubController))
subjectSubRoute.get('/admin/v1/subject_sub/:id/edit', AccessMiddleware, ensureAuthenticated, subjectSubController.edit.bind(subjectSubController))
subjectSubRoute.get('/admin/v1/subject_sub/:id/order_up', AccessMiddleware, ensureAuthenticated, subjectSubController.order_up.bind(subjectSubController))
subjectSubRoute.get('/admin/v1/subject_sub/:id/order_down', AccessMiddleware, ensureAuthenticated, subjectSubController.order_down.bind(subjectSubController))
subjectSubRoute.put('/admin/v1/subject_sub/:id/update', AccessMiddleware, ensureAuthenticated, SubjectSubUpdateValidator, subjectSubController.update.bind(subjectSubController))
subjectSubRoute.get('/admin/v1/subject_sub/:id/delete', AccessMiddleware, ensureAuthenticated, subjectSubController.delete.bind(subjectSubController))
subjectSubRoute.post('/admin/v1/subject_sub/delete_selected', AccessMiddleware, ensureAuthenticated, subjectSubController.delete_selected.bind(subjectSubController))

const subjectSubDetailRoute = Router()
const subjectSubDetailController = new SubjectSubDetailController()
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.index.bind(subjectSubDetailController))
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail/create', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.create.bind(subjectSubDetailController))
subjectSubDetailRoute.post('/admin/v1/subject_sub_detail/store', AccessMiddleware, ensureAuthenticated, SubjectSubDetailCreateValidator, subjectSubDetailController.store.bind(subjectSubDetailController))
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail/:id/edit', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.edit.bind(subjectSubDetailController))
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail/:id/order_up', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.order_up.bind(subjectSubDetailController))
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail/:id/order_down', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.order_down.bind(subjectSubDetailController))
subjectSubDetailRoute.put('/admin/v1/subject_sub_detail/:id/update', AccessMiddleware, ensureAuthenticated, SubjectSubDetailUpdateValidator, subjectSubDetailController.update.bind(subjectSubDetailController))
subjectSubDetailRoute.get('/admin/v1/subject_sub_detail/:id/delete', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.delete.bind(subjectSubDetailController))
subjectSubDetailRoute.post('/admin/v1/subject_sub_detail/delete_selected', AccessMiddleware, ensureAuthenticated, subjectSubDetailController.delete_selected.bind(subjectSubDetailController))

const subjectSubDetailContentRoute = Router()
const subjectSubDetailContentController = new SubjectSubDetailContentController()
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.index.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/create', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.create.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.post('/admin/v1/subject_sub_detail_content/store', AccessMiddleware, ensureAuthenticated, SubjectSubDetailContentCreateValidator, subjectSubDetailContentController.store.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/:id/show', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.show.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/:id/edit', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.edit.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/:id/order_up', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.order_up.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/:id/order_down', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.order_down.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.put('/admin/v1/subject_sub_detail_content/:id/update', AccessMiddleware, ensureAuthenticated, SubjectSubDetailContentUpdateValidator, subjectSubDetailContentController.update.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_detail_content/:id/delete', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.delete.bind(subjectSubDetailContentController))
subjectSubDetailContentRoute.post('/admin/v1/subject_sub_detail_content/delete_selected', AccessMiddleware, ensureAuthenticated, subjectSubDetailContentController.delete_selected.bind(subjectSubDetailContentController))

router.use(subjectRoute,subjectSubRoute,subjectSubDetailRoute, subjectSubDetailContentRoute)

export default router