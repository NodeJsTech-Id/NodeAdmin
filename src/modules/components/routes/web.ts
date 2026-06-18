import { Router } from 'express'
import { namedRoutes as named } from '@nodeadmin/core'
import ComponentController from '../http/controllers/web/v1/ComponentController'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { handler } from '@nodeadmin/core'

const router = Router()
const r = named.extendRouter(Router())

r.get('admin.v1.components.index', '/admin/v1/components', ensureAuthenticated, AccessMiddleware, handler(ComponentController, 'index'))

router.use(r)
export default router
