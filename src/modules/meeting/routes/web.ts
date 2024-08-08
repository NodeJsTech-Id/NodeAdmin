import { Router } from 'express'
import AccessMiddleware from '../../access/http/middleware/AccessMiddleware'
import { ensureAuthenticated } from '../../auth/http/middleware/authMiddleware'
import MeetingController from '../http/controllers/web/v1/MeetingController'
import { MeetingCreateValidator } from '../http/validators/MeetingCreateValidator'
import { MeetingUpdateValidator } from '../http/validators/MeetingUpdateValidator'
import MeetingDetailController from '../http/controllers/web/v1/MeetingDetailController'
import { MeetingDetailCreateValidator } from '../http/validators/MeetingDetailCreateValidator'
import { MeetingDetailUpdateValidator } from '../http/validators/MeetingDetailUpdateValidator'
import MentorMeetingController from '../http/controllers/web/v1/MentorMeetingController'
import MentorMeetingDetailController from '../http/controllers/web/v1/MentorMeetingDetailController'
import MenteeMeetingController from '../http/controllers/web/v1/MenteeMeetingController'
import MenteeMeetingDetailController from '../http/controllers/web/v1/MenteeMeetingDetailController'

const router = Router()

// define route & set middleware user
const meetingRoute = Router()

const meetingController = new MeetingController()
const meetingDetailController = new MeetingDetailController()
meetingRoute.get('/admin/v1/meeting', AccessMiddleware, ensureAuthenticated, meetingController.index.bind(meetingController))
meetingRoute.get('/admin/v1/meeting/create', AccessMiddleware, ensureAuthenticated, meetingController.create.bind(meetingController))
meetingRoute.post('/admin/v1/meeting/store', AccessMiddleware, ensureAuthenticated, MeetingCreateValidator, meetingController.store.bind(meetingController))
meetingRoute.get('/admin/v1/meeting/:id/edit', AccessMiddleware, ensureAuthenticated, meetingController.edit.bind(meetingController))
meetingRoute.put('/admin/v1/meeting/:id/update', AccessMiddleware, ensureAuthenticated, MeetingUpdateValidator, meetingController.update.bind(meetingController))
meetingRoute.get('/admin/v1/meeting/:id/delete', AccessMiddleware, ensureAuthenticated, meetingController.delete.bind(meetingController))
meetingRoute.post('/admin/v1/meeting/delete_selected', AccessMiddleware, ensureAuthenticated, meetingController.delete_selected.bind(meetingController))
meetingRoute.get('/admin/v1/meeting/:id/users', AccessMiddleware, ensureAuthenticated, meetingController.meeting_users.bind(meetingController))
meetingRoute.post('/admin/v1/meeting/:id/users/assign', AccessMiddleware, ensureAuthenticated, meetingController.meeting_users_assign.bind(meetingController))
meetingRoute.get('/admin/v1/meeting/:id/mentor', AccessMiddleware, ensureAuthenticated, meetingController.meeting_mentor.bind(meetingController))
meetingRoute.post('/admin/v1/meeting/:id/mentor/assign', AccessMiddleware, ensureAuthenticated, meetingController.meeting_mentor_assign.bind(meetingController))

meetingRoute.get('/admin/v1/meeting/:meeting_id/details', AccessMiddleware, ensureAuthenticated, meetingDetailController.index.bind(meetingDetailController))
meetingRoute.get('/admin/v1/meeting/:meeting_id/details/create', AccessMiddleware, ensureAuthenticated, meetingDetailController.create.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/store', AccessMiddleware, ensureAuthenticated, MeetingDetailCreateValidator, meetingDetailController.store.bind(meetingDetailController))
meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:id/edit', AccessMiddleware, ensureAuthenticated, meetingDetailController.edit.bind(meetingDetailController))
meetingRoute.put('/admin/v1/meeting/:meeting_id/details/:id/update', AccessMiddleware, ensureAuthenticated, MeetingDetailUpdateValidator, meetingDetailController.update.bind(meetingDetailController))
meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:id/delete', AccessMiddleware, ensureAuthenticated, meetingDetailController.delete.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/delete_selected', AccessMiddleware, ensureAuthenticated, meetingDetailController.delete_selected.bind(meetingDetailController))

meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:id/start_meeting', AccessMiddleware, ensureAuthenticated, meetingDetailController.start_meeting.bind(meetingDetailController))
meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:id/join_meeting', AccessMiddleware, ensureAuthenticated, meetingDetailController.join_meeting.bind(meetingDetailController))
meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:id/finish_meeting', AccessMiddleware, ensureAuthenticated, meetingDetailController.finish_meeting.bind(meetingDetailController))

meetingRoute.get('/admin/v1/meeting/:meeting_id/details/:meeting_detail_id/user_presences', AccessMiddleware, ensureAuthenticated, meetingDetailController.user_presences.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/:meeting_detail_id/user_presences/:id/present', AccessMiddleware, ensureAuthenticated, meetingDetailController.user_presences_present.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/:meeting_detail_id/user_presences/present_selected', AccessMiddleware, ensureAuthenticated, meetingDetailController.user_presences_present_selected.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/:meeting_detail_id/user_presences/:id/absent', AccessMiddleware, ensureAuthenticated, meetingDetailController.user_presences_absent.bind(meetingDetailController))
meetingRoute.post('/admin/v1/meeting/:meeting_id/details/:meeting_detail_id/user_presences/absent_selected', AccessMiddleware, ensureAuthenticated, meetingDetailController.user_presences_absent_selected.bind(meetingDetailController))

// for mentor
const mentorMeetingController = new MentorMeetingController()
const mentorMeetingDetailController = new MentorMeetingDetailController()
meetingRoute.get('/admin/v1/meeting/mentor', AccessMiddleware, ensureAuthenticated, mentorMeetingController.index.bind(mentorMeetingController))

meetingRoute.get('/admin/v1/meeting/mentor/:meeting_id/details', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.index.bind(mentorMeetingDetailController))

meetingRoute.get('/admin/v1/meeting/mentor/:meeting_id/details/:id/start_meeting', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.start_meeting.bind(mentorMeetingDetailController))
meetingRoute.get('/admin/v1/meeting/mentor/:meeting_id/details/:id/join_meeting', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.join_meeting.bind(mentorMeetingDetailController))
meetingRoute.get('/admin/v1/meeting/mentor/:meeting_id/details/:id/finish_meeting', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.finish_meeting.bind(mentorMeetingDetailController))

meetingRoute.get('/admin/v1/meeting/mentor/:meeting_id/details/:meeting_detail_id/user_presences', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.user_presences.bind(mentorMeetingDetailController))
meetingRoute.post('/admin/v1/meeting/mentor/:meeting_id/details/:meeting_detail_id/user_presences/:id/present', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.user_presences_present.bind(mentorMeetingDetailController))
meetingRoute.post('/admin/v1/meeting/mentor/:meeting_id/details/:meeting_detail_id/user_presences/present_selected', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.user_presences_present_selected.bind(mentorMeetingDetailController))
meetingRoute.post('/admin/v1/meeting/mentor/:meeting_id/details/:meeting_detail_id/user_presences/:id/absent', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.user_presences_absent.bind(mentorMeetingDetailController))
meetingRoute.post('/admin/v1/meeting/mentor/:meeting_id/details/:meeting_detail_id/user_presences/absent_selected', AccessMiddleware, ensureAuthenticated, mentorMeetingDetailController.user_presences_absent_selected.bind(mentorMeetingDetailController))
// end for mentor

// for mentee
const menteeMeetingController = new MenteeMeetingController()
const menteeMeetingDetailController = new MenteeMeetingDetailController()
meetingRoute.get('/admin/v1/meeting/mentee', AccessMiddleware, ensureAuthenticated, menteeMeetingController.index.bind(menteeMeetingController))

meetingRoute.get('/admin/v1/meeting/mentee/:meeting_id/details', AccessMiddleware, ensureAuthenticated, menteeMeetingDetailController.index.bind(menteeMeetingDetailController))

meetingRoute.get('/admin/v1/meeting/mentee/:meeting_id/details/:id/start_meeting', AccessMiddleware, ensureAuthenticated, menteeMeetingDetailController.start_meeting.bind(menteeMeetingDetailController))
meetingRoute.get('/admin/v1/meeting/mentee/:meeting_id/details/:id/join_meeting', AccessMiddleware, ensureAuthenticated, menteeMeetingDetailController.join_meeting.bind(menteeMeetingDetailController))
meetingRoute.get('/admin/v1/meeting/mentee/:meeting_id/details/:id/finish_meeting', AccessMiddleware, ensureAuthenticated, menteeMeetingDetailController.finish_meeting.bind(menteeMeetingDetailController))

meetingRoute.get('/admin/v1/meeting/mentee/:meeting_id/details/:meeting_detail_id/user_presences', AccessMiddleware, ensureAuthenticated, menteeMeetingDetailController.user_presences.bind(menteeMeetingDetailController))
// end for mentee

router.use(meetingRoute)

export default router