import { Router } from 'express'
import UserController from '../http/controllers/web/v1/UserController'
import AccessController from '../http/controllers/web/v1/AccessController'
import AccessMiddleware from '../http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import RoleController from '../http/controllers/web/v1/RoleController'
import { roleValidationRules } from '../http/validators/RoleValidator'
import { accessValidationRules } from '../http/validators/AccessValidator'
import { upload, UserCreateValidator } from '../http/validators/UserCreateValidator'
import { UserUpdateValidator } from '../http/validators/UserUpdateValidator'

const router = Router()

// define route & set middleware user
const userRoute = Router()

const userController = new UserController()
userRoute.get('/admin/v1/access/user', AccessMiddleware, ensureAuthenticated, userController.index.bind(userController))
userRoute.get('/admin/v1/access/user/create', AccessMiddleware, ensureAuthenticated, userController.create.bind(userController))
userRoute.post('/admin/v1/access/user/store', AccessMiddleware, ensureAuthenticated, upload.any(), UserCreateValidator, userController.store.bind(userController))
userRoute.get('/admin/v1/access/user/:id/edit', AccessMiddleware, ensureAuthenticated, userController.edit.bind(userController))
userRoute.put('/admin/v1/access/user/:id/update', AccessMiddleware, ensureAuthenticated, upload.any(), UserUpdateValidator, userController.update.bind(userController))
userRoute.get('/admin/v1/access/user/:id/delete', AccessMiddleware, ensureAuthenticated, userController.delete.bind(userController))
userRoute.post('/admin/v1/access/user/delete_selected', AccessMiddleware, ensureAuthenticated, userController.delete_selected.bind(userController))

// define route & set middleware access
const accessRoute = Router()

const accessController = new AccessController()
accessRoute.get('/admin/v1/access/access', AccessMiddleware, ensureAuthenticated, accessController.index.bind(accessController))
accessRoute.get('/admin/v1/access/access/create', AccessMiddleware, ensureAuthenticated, accessController.create.bind(accessController))
accessRoute.post('/admin/v1/access/access/store', AccessMiddleware, ensureAuthenticated, accessValidationRules(), accessController.store.bind(accessController))
accessRoute.get('/admin/v1/access/access/:id/edit', AccessMiddleware, ensureAuthenticated, accessController.edit.bind(accessController))
accessRoute.put('/admin/v1/access/access/:id/update', AccessMiddleware, ensureAuthenticated, accessValidationRules(), accessController.update.bind(accessController))
accessRoute.get('/admin/v1/access/access/:id/delete', AccessMiddleware, ensureAuthenticated, accessController.delete.bind(accessController))
accessRoute.post('/admin/v1/access/access/delete_selected', AccessMiddleware, ensureAuthenticated, accessController.delete_selected.bind(accessController))

// define route & set middleware role
const roleRoute = Router()

const roleController = new RoleController()
roleRoute.get('/admin/v1/access/role', AccessMiddleware, ensureAuthenticated, roleController.index.bind(roleController))
roleRoute.get('/admin/v1/access/role/create', AccessMiddleware, ensureAuthenticated, roleController.create.bind(roleController))
roleRoute.post('/admin/v1/access/role/store', AccessMiddleware, ensureAuthenticated, roleValidationRules(), roleController.store.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/access', AccessMiddleware, ensureAuthenticated, roleController.access.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/access/:access_id/assign', AccessMiddleware, ensureAuthenticated, roleController.access_assign.bind(roleController))
roleRoute.post('/admin/v1/access/role/:id/access/assign_selected', AccessMiddleware, ensureAuthenticated, roleController.access_assign_selected.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/access/:access_id/unassign', AccessMiddleware, ensureAuthenticated, roleController.access_unassign.bind(roleController))
roleRoute.post('/admin/v1/access/role/:id/access/unassign_selected', AccessMiddleware, ensureAuthenticated, roleController.access_unassign_selected.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/edit', AccessMiddleware, ensureAuthenticated, roleController.edit.bind(roleController))
roleRoute.put('/admin/v1/access/role/:id/update', AccessMiddleware, ensureAuthenticated, roleValidationRules(), roleController.update.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/delete', AccessMiddleware, ensureAuthenticated, roleController.delete.bind(roleController))
roleRoute.post('/admin/v1/access/role/delete_selected', AccessMiddleware, ensureAuthenticated, roleController.delete_selected.bind(roleController))

router.use(userRoute,accessRoute,roleRoute)

export default router