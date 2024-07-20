import { Router } from 'express'
import AuthController from '../http/controllers/api/v1/AuthController'
import { ensureAuthenticatedApi } from '../../auth/http/middleware/authMiddleware'
import { UserCreateValidator } from '../../access/http/validators/UserCreateValidator'
import { ResetPasswordProcessValidator } from '../http/validators/ResetPasswordProcessValidator'

const router = Router()

const authController = new AuthController
router.post('/api/v1/auth/login', authController.login.bind(authController))
router.get('/api/v1/auth/logout', ensureAuthenticatedApi, authController.logout.bind(authController))
router.post('/api/v1/auth/register', UserCreateValidator, authController.register.bind(authController))
router.post('/api/v1/auth/reset/request', authController.request.bind(authController))
router.post('/api/v1/auth/reset/process', ResetPasswordProcessValidator, authController.process.bind(authController))

export default router
