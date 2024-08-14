import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import MeetingDetailService from '../../../services/v1/MeetingDetailService'
import { User } from '../../../../../access/models/user.entity'
import appConfig from '../../../../../../config/app'

export default class MeetingDetailController {
    private meetingDetailService = new MeetingDetailService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.meetingDetailService.index(filter,req.params.meeting_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/index'), {
            datas,
            filter,
            paginate_data,
            meeting_id: req.params.meeting_id,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/create'), {
            meeting_id: req.params.meeting_id,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.meetingDetailService.store(req.body,req.params.meeting_id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Meeting Detail Success.' }
            res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const { data } = await this.meetingDetailService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/edit'), {
            data,
            meeting_id: req.params.meeting_id,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.meetingDetailService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Meeting Detail Success.' }
            res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.meetingDetailService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Meeting Detail Fail.' }
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Meeting Detail Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.meetingDetailService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Meeting Detail Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
    }

    public async start_meeting(req: Request, res: Response) {
        const user = req.user as User
        const meeting = await this.meetingDetailService.start_meeting(req.params.id)
        const join_token = await this.meetingDetailService.generate_join_token(req.params.id, user)
        if (meeting instanceof Error) {
            req.session.flashMessage = { key: 'error', message: meeting.message }
            res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        } else {
            res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/meeting'), {
                meeting,
                credential: meeting.credential,
                user,
                join_token,
                sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
                layout: './layouts/be/plain'
            })
        }
    }

    public async join_meeting(req: Request, res: Response) {
        const user = req.user as User
        const { data } = await this.meetingDetailService.edit(req.params.id)
        const join_token = await this.meetingDetailService.generate_join_token(req.params.id, user)
        const meeting = data
        if (meeting?.status === 'Finished') {
            req.session.flashMessage = { key: 'error', message: 'Meeting Already Finish.' }
            res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        } else {
            res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/meeting'), {
                meeting,
                credential: meeting?.credential,
                user,
                join_token,
                sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
                layout: './layouts/be/plain'
            })
        }
    }

    public async finish_meeting(req: Request, res: Response) {
        const result = await this.meetingDetailService.finish_meeting(req.params.id, req.user as User)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Update Fail.' }
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
        }
        req.session.flashMessage = { key: 'success', message: 'Meeting Finish.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details')
    }

    public async user_presences(req: Request, res: Response) {
        const { users } = await this.meetingDetailService.user_presences(req.params.meeting_detail_id)
        const datas = users
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting_detail/user_presences'), {
            datas,
            meeting_id: req.params.meeting_id,
            meeting_detail_id: req.params.meeting_detail_id,
            layout: './layouts/be/main'
        })
    }

    public async user_presences_present(req: Request, res: Response) {
        const result = await this.meetingDetailService.user_presences_update(req.params.id,"Present",req.body.desc)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Update Fail.' }
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
        }
        req.session.flashMessage = { key: 'success', message: 'Update Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
    }

    public async user_presences_present_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.meetingDetailService.user_presences_update(id,"Present")
        })
        req.session.flashMessage = { key: 'success', message: 'Update Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
    }

    public async user_presences_absent(req: Request, res: Response) {
        const result = await this.meetingDetailService.user_presences_update(req.params.id,"Absent",req.body.desc)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Update Fail.' }
            return res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
        }
        req.session.flashMessage = { key: 'success', message: 'Update Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
    }

    public async user_presences_absent_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.meetingDetailService.user_presences_update(id,"Absent")
        })
        req.session.flashMessage = { key: 'success', message: 'Update Success.' }
        res.redirect('/admin/v1/meeting/'+req.params.meeting_id+'/details/'+req.params.meeting_detail_id+'/user_presences')
    }
}