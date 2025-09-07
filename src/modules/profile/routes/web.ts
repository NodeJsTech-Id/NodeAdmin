import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import { upload, UserUpdateValidator } from '../../access/http/validators/UserUpdateValidator'
import ProfileController from '../http/controllers/web/v1/ProfileController'
const router = Router()

// define route & set middleware user
const profileRoute = named.extendRouter(Router())

const profileController = new ProfileController()
profileRoute.get('admin.v1.profile.index', '/admin/v1/profile', AccessMiddleware, ensureAuthenticated, profileController.index.bind(profileController))
profileRoute.put('admin.v1.profile.update', '/admin/v1/profile/update', AccessMiddleware, ensureAuthenticated, upload.any(), UserUpdateValidator, profileController.update.bind(profileController))

router.use(profileRoute)

export default router
