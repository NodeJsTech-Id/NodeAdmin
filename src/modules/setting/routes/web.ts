import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import { SettingValidator, upload } from '../http/validators/SettingValidator'
import SettingController from '../http/controllers/web/v1/SettingController'
const router = Router()

// define route & set middleware user
const settingRoute = Router()

const settingController = new SettingController()
settingRoute.get('/admin/v1/setting', AccessMiddleware, ensureAuthenticated, settingController.index.bind(settingController))
settingRoute.put('/admin/v1/setting/update', AccessMiddleware, ensureAuthenticated, upload.any(), SettingValidator, settingController.update.bind(settingController))

router.use(settingRoute)

export default router