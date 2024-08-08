import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import ClassController from '../http/controllers/web/v1/ClassController'
import { ClassCreateValidator } from '../http/validators/ClassCreateValidator'
import { ClassUpdateValidator } from '../http/validators/ClassUpdateValidator'
import ClassSubjectController from '../http/controllers/web/v1/ClassSubjectController'
import ClassUserController from '../http/controllers/web/v1/ClassUserController'
import ClassMentorController from '../http/controllers/web/v1/ClassMentorController'
import MentorClassController from '../http/controllers/web/v1/MentorClassController'
import MenteeClassController from '../http/controllers/web/v1/MenteeClassController'

const router = Router()

// define route & set middleware user
const classRoute = Router()

const classController = new ClassController()
const classSubjectController = new ClassSubjectController()
const classUserController = new ClassUserController()
const classMentorController = new ClassMentorController()
classRoute.get('/admin/v1/class', AccessMiddleware, ensureAuthenticated, classController.index.bind(classController))
classRoute.get('/admin/v1/class/create', AccessMiddleware, ensureAuthenticated, classController.create.bind(classController))
classRoute.post('/admin/v1/class/store', AccessMiddleware, ensureAuthenticated, ClassCreateValidator, classController.store.bind(classController))
classRoute.get('/admin/v1/class/:id/edit', AccessMiddleware, ensureAuthenticated, classController.edit.bind(classController))
classRoute.put('/admin/v1/class/:id/update', AccessMiddleware, ensureAuthenticated, ClassUpdateValidator, classController.update.bind(classController))
classRoute.get('/admin/v1/class/:id/delete', AccessMiddleware, ensureAuthenticated, classController.delete.bind(classController))
classRoute.post('/admin/v1/class/delete_selected', AccessMiddleware, ensureAuthenticated, classController.delete_selected.bind(classController))

classRoute.get('/admin/v1/class/:id/subject', AccessMiddleware, ensureAuthenticated, classSubjectController.index.bind(classSubjectController))
classRoute.get('/admin/v1/class/:id/subject/create', AccessMiddleware, ensureAuthenticated, classSubjectController.create.bind(classSubjectController))
classRoute.post('/admin/v1/class/:id/subject/store', AccessMiddleware, ensureAuthenticated, classSubjectController.store.bind(classSubjectController))
classRoute.get('/admin/v1/class/:id/subject/:subject_id/delete', AccessMiddleware, ensureAuthenticated, classSubjectController.delete.bind(classSubjectController))
classRoute.post('/admin/v1/class/:id/subject/delete_selected', AccessMiddleware, ensureAuthenticated, classSubjectController.delete_selected.bind(classSubjectController))

classRoute.get('/admin/v1/class/:id/user', AccessMiddleware, ensureAuthenticated, classUserController.index.bind(classUserController))
classRoute.get('/admin/v1/class/:id/user/create', AccessMiddleware, ensureAuthenticated, classUserController.create.bind(classUserController))
classRoute.post('/admin/v1/class/:id/user/store', AccessMiddleware, ensureAuthenticated, classUserController.store.bind(classUserController))
classRoute.get('/admin/v1/class/:id/user/:user_id/delete', AccessMiddleware, ensureAuthenticated, classUserController.delete.bind(classUserController))
classRoute.post('/admin/v1/class/:id/user/delete_selected', AccessMiddleware, ensureAuthenticated, classUserController.delete_selected.bind(classUserController))

classRoute.get('/admin/v1/class/:id/mentor', AccessMiddleware, ensureAuthenticated, classMentorController.index.bind(classMentorController))
classRoute.get('/admin/v1/class/:id/mentor/create', AccessMiddleware, ensureAuthenticated, classMentorController.create.bind(classMentorController))
classRoute.post('/admin/v1/class/:id/mentor/store', AccessMiddleware, ensureAuthenticated, classMentorController.store.bind(classMentorController))
classRoute.get('/admin/v1/class/:id/mentor/:mentor_id/delete', AccessMiddleware, ensureAuthenticated, classMentorController.delete.bind(classMentorController))
classRoute.post('/admin/v1/class/:id/mentor/delete_selected', AccessMiddleware, ensureAuthenticated, classMentorController.delete_selected.bind(classMentorController))

// for mentor
const mentorClassController = new MentorClassController()
classRoute.get('/admin/v1/class/mentor', AccessMiddleware, ensureAuthenticated, mentorClassController.index.bind(mentorClassController))
classRoute.get('/admin/v1/class/mentor/:id/subject', AccessMiddleware, ensureAuthenticated, mentorClassController.index_subject.bind(mentorClassController))
classRoute.get('/admin/v1/class/mentor/:id/user', AccessMiddleware, ensureAuthenticated, mentorClassController.index_user.bind(mentorClassController))
classRoute.get('/admin/v1/class/mentor/:id/mentor', AccessMiddleware, ensureAuthenticated, mentorClassController.index_mentor.bind(mentorClassController))
// end for mentor

// for mentee
const menteeClassController = new MenteeClassController()
classRoute.get('/admin/v1/class/mentee', AccessMiddleware, ensureAuthenticated, menteeClassController.index.bind(menteeClassController))
classRoute.get('/admin/v1/class/mentee/:id/subject', AccessMiddleware, ensureAuthenticated, menteeClassController.index_subject.bind(menteeClassController))
classRoute.get('/admin/v1/class/mentee/:id/user', AccessMiddleware, ensureAuthenticated, menteeClassController.index_user.bind(menteeClassController))
classRoute.get('/admin/v1/class/mentee/:id/mentor', AccessMiddleware, ensureAuthenticated, menteeClassController.index_mentor.bind(menteeClassController))
// end for mentee

router.use(classRoute)

export default router