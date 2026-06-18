import { Router } from 'express'
import named from '../../../utils/namedRoutes'
import ComponentController from '../http/controllers/web/v1/ComponentController'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { handler } from '../../../utils/routeBinding'

const router = Router()
const r = named.extendRouter(Router())

r.get('admin.v1.components.index', '/admin/v1/components', ensureAuthenticated, AccessMiddleware, handler(ComponentController, 'index'))

router.use(r)
export default router
