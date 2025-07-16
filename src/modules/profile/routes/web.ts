import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import { upload, ProfileValidator } from '../http/validators/ProfileValidator'
import ProfileController from '../http/controllers/web/v1/ProfileController'
import { UserProfileUpdateValidator } from '../../access/http/validators/UserProfileUpdateValidator'
const router = Router()

// define route & set middleware user
const profileRoute = Router()

const profileController = new ProfileController()
profileRoute.get('/admin/v1/profile', AccessMiddleware, ensureAuthenticated, profileController.index.bind(profileController))
profileRoute.put('/admin/v1/profile/update', AccessMiddleware, ensureAuthenticated, upload.any(), ProfileValidator, profileController.update.bind(profileController))
profileRoute.get('/admin/v1/userprofile', AccessMiddleware, ensureAuthenticated, profileController.profile_index.bind(profileController))
profileRoute.put('/admin/v1/userprofile/update', AccessMiddleware, ensureAuthenticated, upload.any(), UserProfileUpdateValidator, profileController.profile_update.bind(profileController))

router.use(profileRoute)

export default router