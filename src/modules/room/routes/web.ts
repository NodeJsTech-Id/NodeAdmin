import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import RoomController from '../http/controllers/web/v1/RoomController'
import { RoomCreateValidator } from '../http/validators/RoomCreateValidator'
import { RoomUpdateValidator } from '../http/validators/RoomUpdateValidator'

const router = Router()

// define route & set middleware user
const roomRoute = Router()

const roomController = new RoomController()
roomRoute.get('/admin/v1/room', AccessMiddleware, ensureAuthenticated, roomController.index.bind(roomController))
roomRoute.get('/admin/v1/room/create', AccessMiddleware, ensureAuthenticated, roomController.create.bind(roomController))
roomRoute.post('/admin/v1/room/store', AccessMiddleware, ensureAuthenticated, RoomCreateValidator, roomController.store.bind(roomController))
roomRoute.get('/admin/v1/room/:id/edit', AccessMiddleware, ensureAuthenticated, roomController.edit.bind(roomController))
roomRoute.put('/admin/v1/room/:id/update', AccessMiddleware, ensureAuthenticated, RoomUpdateValidator, roomController.update.bind(roomController))
roomRoute.get('/admin/v1/room/:id/delete', AccessMiddleware, ensureAuthenticated, roomController.delete.bind(roomController))
roomRoute.post('/admin/v1/room/delete_selected', AccessMiddleware, ensureAuthenticated, roomController.delete_selected.bind(roomController))

router.use(roomRoute)

export default router