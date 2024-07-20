import { Router } from 'express'
import passport from 'passport'
import AuthController from '../http/controllers/web/v1/AuthController'
import { UserCreateValidator } from '../../access/http/validators/UserCreateValidator'
import { ResetPasswordProcessValidator } from '../http/validators/ResetPasswordProcessValidator'

const router = Router()

const authRoute = Router()
const authController = new AuthController
authRoute.get('/auth/login', authController.getLogin.bind(authController))
authRoute.post('/auth/login', passport.authenticate('local', {
    successRedirect: '/admin/v1/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
}))
authRoute.get('/auth/register', authController.getRegister.bind(authController))
authRoute.post('/auth/register', UserCreateValidator, authController.postRegister.bind(authController))
authRoute.post('/auth/logout', authController.logout.bind(authController))

authRoute.get('/admin/v1/auth/reset/req', authController.request_view.bind(authController))
authRoute.get('/admin/v1/auth/reset/proc', authController.process_view.bind(authController))

authRoute.post('/admin/v1/auth/reset/request', authController.request.bind(authController))
authRoute.post('/admin/v1/auth/reset/process', ResetPasswordProcessValidator, authController.process.bind(authController))

router.use(authRoute)

export default router
