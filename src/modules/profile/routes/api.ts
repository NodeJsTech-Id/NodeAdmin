import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import { upload, UserUpdateValidator } from '../../access/http/validators/UserUpdateValidator'
import ProfileController from '../http/controllers/api/v1/ProfileController'
const router = Router()

// define route & set middleware user
const profileRoute = Router()

const profileController = new ProfileController()
profileRoute.get('/api/v1/profile', AccessMiddleware, ensureAuthenticatedApi, profileController.index.bind(profileController))
profileRoute.put('/api/v1/profile/update', AccessMiddleware, ensureAuthenticatedApi, upload.any(), UserUpdateValidator, profileController.update.bind(profileController))

router.use(profileRoute)

export default router