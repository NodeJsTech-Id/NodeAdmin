import { Router } from 'express'
import UserController from '../http/controllers/api/v1/UserController'
import PermissionController from '../http/controllers/api/v1/PermissionController'
import AccessMiddleware from '../http/middleware/AccessMiddleware'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import RoleController from '../http/controllers/api/v1/RoleController'
import { roleValidationRules } from '../http/validators/RoleValidator'
import { permissionValidationRules } from '../http/validators/PermissionValidator'
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
const permissionRoute = Router()

const permissionController = new PermissionController()
permissionRoute.get('/api/v1/access/permission', AccessMiddleware, ensureAuthenticatedApi, permissionController.index.bind(permissionController))
permissionRoute.post('/api/v1/access/permission/store', AccessMiddleware, ensureAuthenticatedApi, permissionValidationRules(), permissionController.store.bind(permissionController))
permissionRoute.get('/api/v1/access/permission/:id/edit', AccessMiddleware, ensureAuthenticatedApi, permissionController.edit.bind(permissionController))
permissionRoute.put('/api/v1/access/permission/:id/update', AccessMiddleware, ensureAuthenticatedApi, permissionValidationRules(), permissionController.update.bind(permissionController))
permissionRoute.get('/api/v1/access/permission/:id/delete', AccessMiddleware, ensureAuthenticatedApi, permissionController.delete.bind(permissionController))
permissionRoute.post('/api/v1/access/permission/delete_selected', AccessMiddleware, ensureAuthenticatedApi, permissionController.delete_selected.bind(permissionController))

// define route & set middleware role
const roleRoute = Router()

const roleController = new RoleController()
roleRoute.get('/api/v1/access/role', AccessMiddleware, ensureAuthenticatedApi, roleController.index.bind(roleController))
roleRoute.post('/api/v1/access/role/store', AccessMiddleware, ensureAuthenticatedApi, roleValidationRules(), roleController.store.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/permission', AccessMiddleware, ensureAuthenticatedApi, roleController.permission.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/permission/:permission_id/assign', AccessMiddleware, ensureAuthenticatedApi, roleController.permission_assign.bind(roleController))
roleRoute.post('/api/v1/access/role/:id/permission/assign_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.permission_assign_selected.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/permission/:permission_id/unassign', AccessMiddleware, ensureAuthenticatedApi, roleController.permission_unassign.bind(roleController))
roleRoute.post('/api/v1/access/role/:id/permission/unassign_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.permission_unassign_selected.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/edit', AccessMiddleware, ensureAuthenticatedApi, roleController.edit.bind(roleController))
roleRoute.put('/api/v1/access/role/:id/update', AccessMiddleware, ensureAuthenticatedApi, roleValidationRules(), roleController.update.bind(roleController))
roleRoute.get('/api/v1/access/role/:id/delete', AccessMiddleware, ensureAuthenticatedApi, roleController.delete.bind(roleController))
roleRoute.post('/api/v1/access/role/delete_selected', AccessMiddleware, ensureAuthenticatedApi, roleController.delete_selected.bind(roleController))

router.use(userRoute,permissionRoute,roleRoute)

export default router
