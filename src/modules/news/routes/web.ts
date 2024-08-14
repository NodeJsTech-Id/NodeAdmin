import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import NewsController from '../http/controllers/web/v1/NewsController'
import { NewsCreateValidator, upload } from '../http/validators/NewsCreateValidator'
import { NewsUpdateValidator, upload as uploadUpdate } from '../http/validators/NewsUpdateValidator'
import NewsCategoryController from '../http/controllers/web/v1/NewsCategoryController'
import { NewsCategoryCreateValidator } from '../http/validators/NewsCategoryCreateValidator'
import { NewsCategoryUpdateValidator } from '../http/validators/NewsCategoryUpdateValidator'

const router = Router()

// define route & set middleware user
const newsRoute = Router()

const newsController = new NewsController()
newsRoute.get('/news/:slug', newsController.show.bind(newsController))

newsRoute.get('/admin/v1/news', AccessMiddleware, ensureAuthenticated, newsController.index.bind(newsController))
newsRoute.get('/admin/v1/news/create', AccessMiddleware, ensureAuthenticated, newsController.create.bind(newsController))
newsRoute.post('/admin/v1/news/store', AccessMiddleware, ensureAuthenticated, upload.any(),NewsCreateValidator, newsController.store.bind(newsController))
newsRoute.get('/admin/v1/news/:id/edit', AccessMiddleware, ensureAuthenticated, newsController.edit.bind(newsController))
newsRoute.put('/admin/v1/news/:id/update', AccessMiddleware, ensureAuthenticated, uploadUpdate.any(),NewsUpdateValidator, newsController.update.bind(newsController))
newsRoute.get('/admin/v1/news/:id/delete', AccessMiddleware, ensureAuthenticated, newsController.delete.bind(newsController))
newsRoute.post('/admin/v1/news/delete_selected', AccessMiddleware, ensureAuthenticated, newsController.delete_selected.bind(newsController))

const newsCategoryRoute = Router()

const newsCategoryController = new NewsCategoryController()
newsCategoryRoute.get('/admin/v1/news/category', AccessMiddleware, ensureAuthenticated, newsCategoryController.index.bind(newsCategoryController))
newsCategoryRoute.get('/admin/v1/news/category/create', AccessMiddleware, ensureAuthenticated, newsCategoryController.create.bind(newsCategoryController))
newsCategoryRoute.post('/admin/v1/news/category/store', AccessMiddleware, ensureAuthenticated, NewsCategoryCreateValidator, newsCategoryController.store.bind(newsCategoryController))
newsCategoryRoute.get('/admin/v1/news/category/:id/edit', AccessMiddleware, ensureAuthenticated, newsCategoryController.edit.bind(newsCategoryController))
newsCategoryRoute.put('/admin/v1/news/category/:id/update', AccessMiddleware, ensureAuthenticated, NewsCategoryUpdateValidator, newsCategoryController.update.bind(newsCategoryController))
newsCategoryRoute.get('/admin/v1/news/category/:id/delete', AccessMiddleware, ensureAuthenticated, newsCategoryController.delete.bind(newsCategoryController))
newsCategoryRoute.post('/admin/v1/news/category/delete_selected', AccessMiddleware, ensureAuthenticated, newsCategoryController.delete_selected.bind(newsCategoryController))

router.use(newsRoute,newsCategoryRoute)

export default router