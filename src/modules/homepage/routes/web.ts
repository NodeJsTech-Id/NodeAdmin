import { Router } from 'express'
import HomepageController from '../http/controllers/web/v1/HomepageController'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import { HomepageMenuCreateValidator } from '../http/validators/HomepageMenuCreateValidator'
import { HomepageMenuUpdateValidator } from '../http/validators/HomepageMenuUpdateValidator'
import HomepageMenuController from '../http/controllers/web/v1/HomepageMenuController'

const router = Router()

// define route & set middleware
const homepagedRoute = Router()
const homepageController = new HomepageController()
homepagedRoute.get('/', homepageController.index.bind(homepageController))

const homepageMenuRoute = Router()
const homepageMenuController = new HomepageMenuController()
homepageMenuRoute.get('/admin/v1/homepage/menu', AccessMiddleware, ensureAuthenticated, homepageMenuController.index.bind(homepageMenuController))
homepageMenuRoute.get('/admin/v1/homepage/menu/create', AccessMiddleware, ensureAuthenticated, homepageMenuController.create.bind(homepageMenuController))
homepageMenuRoute.post('/admin/v1/homepage/menu/store', AccessMiddleware, ensureAuthenticated, HomepageMenuCreateValidator, homepageMenuController.store.bind(homepageMenuController))
homepageMenuRoute.get('/admin/v1/homepage/menu/:id/edit', AccessMiddleware, ensureAuthenticated, homepageMenuController.edit.bind(homepageMenuController))
homepageMenuRoute.put('/admin/v1/homepage/menu/:id/update', AccessMiddleware, ensureAuthenticated, HomepageMenuUpdateValidator, homepageMenuController.update.bind(homepageMenuController))
homepageMenuRoute.get('/admin/v1/homepage/menu/:id/delete', AccessMiddleware, ensureAuthenticated, homepageMenuController.delete.bind(homepageMenuController))
homepageMenuRoute.post('/admin/v1/homepage/menu/delete_selected', AccessMiddleware, ensureAuthenticated, homepageMenuController.delete_selected.bind(homepageMenuController))

router.use(homepagedRoute,homepageMenuRoute)

export default router
