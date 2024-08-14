import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import MeetingService from '../../../services/v1/MeetingService'
import appConfig from '../../../../../../config/app'

export default class MeetingController {
    private meetingService = new MeetingService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,rooms,classes,schedules,users} = await this.meetingService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting/index'), {
            datas,
            filter,
            paginate_data,
            rooms,
            classes,
            schedules,
            users,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {rooms,classes,schedules,users} = await this.meetingService.create()
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting/create'), {
            rooms,
            classes,
            schedules,
            users,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.meetingService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Meeting Success.' }
            res.redirect('/admin/v1/meeting')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/meeting/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const { data, rooms, classes, schedules } = await this.meetingService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting/edit'), {
            data,
            rooms,
            classes,
            schedules,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.meetingService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Meeting Success.' }
            res.redirect('/admin/v1/meeting')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/meeting/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.meetingService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Meeting Fail.' }
            return res.redirect('/admin/v1/meeting')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Meeting Success.' }
        res.redirect('/admin/v1/meeting')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.meetingService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Meeting Success.' }
        res.redirect('/admin/v1/meeting')
    }

    public async meeting_users(req: Request, res: Response) {
        const { meeting, users } = await this.meetingService.meeting_users(req.params.id)
        const data = meeting
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting/meeting_users'), {
            data,
            users,
            layout: './layouts/be/main'
        })
    }

    public async meeting_users_assign(req: Request, res: Response) {
        try {
            const result = await this.meetingService.meeting_users_assign(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Meeting Users Success.' }
            res.redirect('/admin/v1/meeting/'+req.params.id+'/users')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/meeting/'+req.params.id+'/users')
        }
    }

    public async meeting_mentor(req: Request, res: Response) {
        const { meeting, users } = await this.meetingService.meeting_mentor(req.params.id)
        const data = meeting
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/meeting/meeting_mentor'), {
            data,
            users,
            layout: './layouts/be/main'
        })
    }

    public async meeting_mentor_assign(req: Request, res: Response) {
        try {
            const result = await this.meetingService.meeting_mentor_assign(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Meeting Mentor Success.' }
            res.redirect('/admin/v1/meeting')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/meeting/'+req.params.id+'/mentor')
        }
    }
}