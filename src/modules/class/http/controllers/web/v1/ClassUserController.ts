import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'

export default class ClassUserController {
    private classService = new ClassService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_user(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views/user/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {classData,users} = await this.classService.create_user(req.params.id)
        res.render(path.resolve(Module.path, 'views/user/create'), {
            classData,
            users,
            layout: './layouts/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.classService.store_user(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Add User Success.' }
            res.redirect(`/admin/v1/class/${req.params.id}/user`)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect(`/admin/v1/class/${req.params.id}/user/create`)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.classService.delete_user(req.params.id,req.params.user_id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Remove User Fail.' }
            res.redirect(`/admin/v1/class/${req.params.id}/user`)
        }
        req.session.flashMessage = { key: 'success', message: 'Remove User Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/user`)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.classService.delete_user(req.params.id,id)
        })
        req.session.flashMessage = { key: 'success', message: 'Remove User Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/user`)
    }
}