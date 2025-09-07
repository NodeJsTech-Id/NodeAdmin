import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import passport from 'passport'
import AuthController from '../http/controllers/web/v1/AuthController'
import { UserCreateValidator } from '../../access/http/validators/UserCreateValidator'
import { ResetPasswordProcessValidator } from '../http/validators/ResetPasswordProcessValidator'

const router = Router()

const authRoute = named.extendRouter(Router())
const authController = new AuthController
authRoute.get('web.auth.login', '/auth/login', authController.getLogin.bind(authController))
authRoute.post('web.auth.login.post', '/auth/login', passport.authenticate('local', {
    successRedirect: '/admin/v1/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
}))
authRoute.get('web.auth.register', '/auth/register', authController.getRegister.bind(authController))
authRoute.post('web.auth.register.post', '/auth/register', UserCreateValidator, authController.postRegister.bind(authController))
authRoute.post('web.auth.logout', '/auth/logout', authController.logout.bind(authController))

authRoute.get('admin.v1.auth.reset.req', '/admin/v1/auth/reset/req', authController.request_view.bind(authController))
authRoute.get('admin.v1.auth.reset.proc', '/admin/v1/auth/reset/proc', authController.process_view.bind(authController))

authRoute.post('admin.v1.auth.reset.request', '/admin/v1/auth/reset/request', authController.request.bind(authController))
authRoute.post('admin.v1.auth.reset.process', '/admin/v1/auth/reset/process', ResetPasswordProcessValidator, authController.process.bind(authController))

router.use(authRoute)

export default router
