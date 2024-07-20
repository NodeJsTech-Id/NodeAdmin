import { Router } from 'express'
import UserController from '../http/controllers/api/v1/UserController'
import AccessController from '../http/controllers/api/v1/AccessController'
import AccessMiddleware from '../http/middleware/AccessMiddleware'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import RoleController from '../http/controllers/api/v1/RoleController'
import { roleValidationRules } from '../http/validators/RoleValidator'
import { accessValidationRules } from '../http/validators/AccessValidator'
import { upload, UserCreateValidator } from '../http/validators/UserCreateValidator'
import { UserUpdateValidator } from '../http/validators/UserUpdateValidator'

const router = Router()

// define route & set middleware user
const userRoute = Router()

const userController = new UserController()
userRoute.get('/api/v1/access/user', AccessMiddleware, ensureAuthenticatedApi, userController.index.bind(userController))
userRoute.post('/api/v1/access/user/store', AccessMiddleware, ensureAuthenticatedApi, upload.any(), UserCreateValidator, userController.store.bind(userController))
userRoute.get('/api/v1/access/user/:id/edit', AccessMiddleware, ensureAuthenticatedApi, userController.edit.bind(userController))
userRoute.put('/api/v1/access/user/:id/update', AccessMiddleware, ensureAuthenticatedApi, upload.any(), UserUpdateValidator, userController.update.bind(userController))
userRoute.get('/api/v1/access/user/:id/delete', AccessMiddleware, ensureAuthenticatedApi, userController.delete.bind(userController))
userRoute.post('/api/v1/access/user/delete_selected', AccessMiddleware, ensureAuthenticatedApi, userController.delete_selected.bind(userController))

// define route & set middleware access
const accessRoute = Router()

const accessController = new AccessController()
accessRoute.get('/api/v1/access/access', AccessMiddleware, ensureAuthenticatedApi, accessController.index.bind(accessController))
accessRoute.post('/api/v1/access/access/store', AccessMiddleware, ensureAuthenticatedApi, accessValidationRules(), accessController.store.bind(accessController))
accessRoute.get('/api/v1/access/access/:id/edit', AccessMiddleware, ensureAuthenticatedApi, accessController.edit.bind(accessController))
accessRoute.put('/api/v1/access/access/:id/update', AccessMiddleware, ensureAuthenticatedApi, accessValidationRules(), accessController.update.bind(accessController))
accessRoute.get('/api/v1/access/access/:id/delete', AccessMiddleware, ensureAuthenticatedApi, accessController.delete.bind(accessController))
accessRoute.post('/api/v1/access/access/delete_selected', AccessMiddleware, ensureAuthenticatedApi, accessController.delete_selected.bind(accessController))

// define route & set middleware role
const roleRoute = Router()

const roleController = new RoleController()
roleRoute.get('/api/v1/access/role', AccessMiddleware, ensureAuthenticatedApi, roleController.index.bind(roleController))
roleRoute.post('/api/v1/access/role/store', AccessMiddleware, ensureAuthenticatedApi, roleValidationRules(), roleController.store.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/access', AccessMiddleware, ensureAuthenticatedApi, roleController.access.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/access/:access_id/assign', AccessMiddleware, ensureAuthenticatedApi, roleController.access_assign.bind(roleController))
roleRoute.post('/api/v1/access/role/:id/access/assign_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.access_assign_selected.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/access/:access_id/unassign', AccessMiddleware, ensureAuthenticatedApi, roleController.access_unassign.bind(roleController))
roleRoute.post('/api/v1/access/role/:id/access/unassign_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.access_unassign_selected.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/edit', AccessMiddleware, ensureAuthenticatedApi, roleController.edit.bind(roleController))
roleRoute.put('/api/v1/access/role/:id/update', AccessMiddleware, ensureAuthenticatedApi, roleValidationRules(), roleController.update.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/delete', AccessMiddleware, ensureAuthenticatedApi, roleController.delete.bind(roleController))
roleRoute.post('/api/v1/access/role/delete_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.delete_selected.bind(roleController))

router.use(userRoute,accessRoute,roleRoute)

export default router