import { Router } from 'express'
import HomepageController from '../http/controllers/web/v1/HomepageController'

const router = Router()

// define route & set middleware
const homepagedRoute = Router()
const homepageController = new HomepageController()
homepagedRoute.get('/', homepageController.index.bind(homepageController))

router.use(homepagedRoute)

export default router
