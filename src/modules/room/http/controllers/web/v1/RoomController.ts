import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import RoomService from '../../../services/v1/RoomService'
import appConfig from '../../../../../../config/app'

export default class RoomController {
    private roomService = new RoomService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.roomService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/room/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/room/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.roomService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Room Success.' }
            res.redirect('/admin/v1/room')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/room/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.roomService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/room/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.roomService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Room Success.' }
            res.redirect('/admin/v1/room')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/room/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.roomService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Room Fail.' }
            return res.redirect('/admin/v1/room')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Room Success.' }
        res.redirect('/admin/v1/room')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.roomService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Room Success.' }
        res.redirect('/admin/v1/room')
    }
}