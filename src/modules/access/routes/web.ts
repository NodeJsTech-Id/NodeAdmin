import { Router } from 'express'
import UserController from '../http/controllers/web/v1/UserController'
import PermissionController from '../http/controllers/web/v1/PermissionController'
import AccessMiddleware from '../http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import RoleController from '../http/controllers/web/v1/RoleController'
import { roleValidationRules } from '../http/validators/RoleValidator'
import { permissionValidationRules } from '../http/validators/PermissionValidator'
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
const permissionRoute = Router()

const permissionController = new PermissionController()
permissionRoute.get('/admin/v1/access/permission', AccessMiddleware, ensureAuthenticated, permissionController.index.bind(permissionController))
permissionRoute.get('/admin/v1/access/permission/create', AccessMiddleware, ensureAuthenticated, permissionController.create.bind(permissionController))
permissionRoute.post('/admin/v1/access/permission/store', AccessMiddleware, ensureAuthenticated, permissionValidationRules(), permissionController.store.bind(permissionController))
permissionRoute.get('/admin/v1/access/permission/:id/edit', AccessMiddleware, ensureAuthenticated, permissionController.edit.bind(permissionController))
permissionRoute.put('/admin/v1/access/permission/:id/update', AccessMiddleware, ensureAuthenticated, permissionValidationRules(), permissionController.update.bind(permissionController))
permissionRoute.get('/admin/v1/access/permission/:id/delete', AccessMiddleware, ensureAuthenticated, permissionController.delete.bind(permissionController))
permissionRoute.post('/admin/v1/access/permission/delete_selected', AccessMiddleware, ensureAuthenticated, permissionController.delete_selected.bind(permissionController))

// define route & set middleware role
const roleRoute = Router()

const roleController = new RoleController()
roleRoute.get('/admin/v1/access/role', AccessMiddleware, ensureAuthenticated, roleController.index.bind(roleController))
roleRoute.get('/admin/v1/access/role/create', AccessMiddleware, ensureAuthenticated, roleController.create.bind(roleController))
roleRoute.post('/admin/v1/access/role/store', AccessMiddleware, ensureAuthenticated, roleValidationRules(), roleController.store.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/permission', AccessMiddleware, ensureAuthenticated, roleController.permission.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/permission/:permission_id/assign', AccessMiddleware, ensureAuthenticated, roleController.permission_assign.bind(roleController))
roleRoute.post('/admin/v1/access/role/:id/permission/assign_selected', AccessMiddleware, ensureAuthenticated, roleController.permission_assign_selected.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/permission/:permission_id/unassign', AccessMiddleware, ensureAuthenticated, roleController.permission_unassign.bind(roleController))
roleRoute.post('/admin/v1/access/role/:id/permission/unassign_selected', AccessMiddleware, ensureAuthenticated, roleController.permission_unassign_selected.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/edit', AccessMiddleware, ensureAuthenticated, roleController.edit.bind(roleController))
roleRoute.put('/admin/v1/access/role/:id/update', AccessMiddleware, ensureAuthenticated, roleValidationRules(), roleController.update.bind(roleController))
roleRoute.get('/admin/v1/access/role/:id/delete', AccessMiddleware, ensureAuthenticated, roleController.delete.bind(roleController))
roleRoute.post('/admin/v1/access/role/delete_selected', AccessMiddleware, ensureAuthenticated, roleController.delete_selected.bind(roleController))

router.use(userRoute,permissionRoute,roleRoute)

export default router
