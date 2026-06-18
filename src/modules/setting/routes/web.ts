import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import { SettingValidator, upload } from '../http/validators/SettingValidator'
import SettingController from '../http/controllers/web/v1/SettingController'
import { handler } from '../../../utils/routeBinding'
const router = Router()

// define route & set middleware user
const settingRoute = named.extendRouter(Router())

settingRoute.get('admin.v1.setting.index', '/admin/v1/setting', ensureAuthenticated, AccessMiddleware, handler(SettingController, 'index'))
settingRoute.put('admin.v1.setting.update', '/admin/v1/setting/update', ensureAuthenticated, AccessMiddleware, upload.any(), SettingValidator, handler(SettingController, 'update'))

router.use(settingRoute)

export default router
