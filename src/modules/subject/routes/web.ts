import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import SubjectController from '../http/controllers/web/v1/SubjectController'
import { SubjectCreateValidator } from '../http/validators/SubjectCreateValidator'
import { SubjectUpdateValidator } from '../http/validators/SubjectUpdateValidator'
import { SubjectSubCreateValidator } from '../http/validators/SubjectSubCreateValidator'
import { SubjectSubUpdateValidator } from '../http/validators/SubjectSubUpdateValidator'
import SubjectSubController from '../http/controllers/web/v1/SubjectSubController'
import { SubjectSubDetailContentCreateValidator } from '../http/validators/SubjectSubDetailContentCreateValidator'
import { SubjectSubDetailContentUpdateValidator } from '../http/validators/SubjectSubDetailContentUpdateValidator'
import SubjectFileController from '../http/controllers/web/v1/SubjectFileController'
import { upload, SubjectFileValidator } from '../http/validators/SubjectFileValidator'
import SubjectSubContentController from '../http/controllers/web/v1/SubjectSubContentController'

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

const subjectSubDetailContentRoute = Router()
const subjectSubContentController = new SubjectSubContentController()
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content', AccessMiddleware, ensureAuthenticated, subjectSubContentController.index.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/create', AccessMiddleware, ensureAuthenticated, subjectSubContentController.create.bind(subjectSubContentController))
subjectSubDetailContentRoute.post('/admin/v1/subject_sub_content/store', AccessMiddleware, ensureAuthenticated, SubjectSubDetailContentCreateValidator, subjectSubContentController.store.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/:id/show', AccessMiddleware, ensureAuthenticated, subjectSubContentController.show.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/:id/edit', AccessMiddleware, ensureAuthenticated, subjectSubContentController.edit.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/:id/order_up', AccessMiddleware, ensureAuthenticated, subjectSubContentController.order_up.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/:id/order_down', AccessMiddleware, ensureAuthenticated, subjectSubContentController.order_down.bind(subjectSubContentController))
subjectSubDetailContentRoute.put('/admin/v1/subject_sub_content/:id/update', AccessMiddleware, ensureAuthenticated, SubjectSubDetailContentUpdateValidator, subjectSubContentController.update.bind(subjectSubContentController))
subjectSubDetailContentRoute.get('/admin/v1/subject_sub_content/:id/delete', AccessMiddleware, ensureAuthenticated, subjectSubContentController.delete.bind(subjectSubContentController))
subjectSubDetailContentRoute.post('/admin/v1/subject_sub_content/delete_selected', AccessMiddleware, ensureAuthenticated, subjectSubContentController.delete_selected.bind(subjectSubContentController))

const subjectFileRoute = Router()
const subjectFileController = new SubjectFileController()
subjectFileRoute.get('/admin/v1/subject/:subject_id/file', AccessMiddleware, ensureAuthenticated, subjectFileController.index.bind(subjectFileController))
subjectFileRoute.post('/admin/v1/subject/:subject_id/file/store', AccessMiddleware, ensureAuthenticated, upload.any(), SubjectFileValidator, subjectFileController.store.bind(subjectFileController))
subjectFileRoute.delete('/admin/v1/subject/:subject_id/file/:id/delete', AccessMiddleware, ensureAuthenticated, subjectFileController.delete.bind(subjectFileController))

router.use(subjectRoute, subjectSubRoute, subjectSubDetailContentRoute, subjectFileRoute)

export default router