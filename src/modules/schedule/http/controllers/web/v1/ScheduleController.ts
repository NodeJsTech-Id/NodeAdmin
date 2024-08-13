import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ScheduleService from '../../../services/v1/ScheduleService'

export default class ScheduleController {
    private scheduleService = new ScheduleService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.scheduleService.index(filter)
        res.render(path.resolve(Module.path, 'views/be/schedule/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views/be/schedule/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.scheduleService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Schedule Success.' }
            res.redirect('/admin/v1/schedule')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/schedule/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.scheduleService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views/be/schedule/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.scheduleService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Schedule Success.' }
            res.redirect('/admin/v1/schedule')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/schedule/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.scheduleService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Schedule Fail.' }
            return res.redirect('/admin/v1/schedule')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Schedule Success.' }
        res.redirect('/admin/v1/schedule')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.scheduleService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Schedule Success.' }
        res.redirect('/admin/v1/schedule')
    }
}