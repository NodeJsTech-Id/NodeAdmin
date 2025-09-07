import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import { upload, ProfileUpdateValidator } from '../http/validators/ProfileUpdateValidator'
import ProfileController from '../http/controllers/api/v1/ProfileController'
const router = Router()

// define route & set middleware user
const profileRoute = named.extendRouter(Router())

const profileController = new ProfileController()
profileRoute.get('api.v1.profile.index', '/api/v1/profile', AccessMiddleware, ensureAuthenticatedApi, profileController.index.bind(profileController))
profileRoute.put('api.v1.profile.update', '/api/v1/profile/update', AccessMiddleware, ensureAuthenticatedApi, upload.any(), ProfileUpdateValidator, profileController.update.bind(profileController))

router.use(profileRoute)

export default router
