import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import CategoryController from '../http/controllers/web/v1/CategoryController'
import { CategoryCreateValidator } from '../http/validators/CategoryCreateValidator'
import { CategoryUpdateValidator } from '../http/validators/CategoryUpdateValidator'

const router = Router()

// define route & set middleware user
const categoryRoute = Router()

const categoryController = new CategoryController()
categoryRoute.get('/admin/v1/category', AccessMiddleware, ensureAuthenticated, categoryController.index.bind(categoryController))
categoryRoute.get('/admin/v1/category/create', AccessMiddleware, ensureAuthenticated, categoryController.create.bind(categoryController))
categoryRoute.post('/admin/v1/category/store', AccessMiddleware, ensureAuthenticated, CategoryCreateValidator, categoryController.store.bind(categoryController))
categoryRoute.get('/admin/v1/category/:id/edit', AccessMiddleware, ensureAuthenticated, categoryController.edit.bind(categoryController))
categoryRoute.put('/admin/v1/category/:id/update', AccessMiddleware, ensureAuthenticated, CategoryUpdateValidator, categoryController.update.bind(categoryController))
categoryRoute.get('/admin/v1/category/:id/delete', AccessMiddleware, ensureAuthenticated, categoryController.delete.bind(categoryController))
categoryRoute.post('/admin/v1/category/delete_selected', AccessMiddleware, ensureAuthenticated, categoryController.delete_selected.bind(categoryController))

router.use(categoryRoute)

export default router