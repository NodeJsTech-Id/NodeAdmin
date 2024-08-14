import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'
import appConfig from '../../../../../../config/app'

export default class ClassMentorController {
    private classService = new ClassService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_mentor(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentor/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {classData,users} = await this.classService.create_mentor(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentor/create'), {
            classData,
            users,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.classService.store_mentor(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Add User Success.' }
            res.redirect(`/admin/v1/class/${req.params.id}/mentor`)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect(`/admin/v1/class/${req.params.id}/mentor/create`)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.classService.delete_mentor(req.params.id,req.params.mentor_id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Remove User Fail.' }
            res.redirect(`/admin/v1/class/${req.params.id}/mentor`)
        }
        req.session.flashMessage = { key: 'success', message: 'Remove User Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/mentor`)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.classService.delete_mentor(req.params.id,id)
        })
        req.session.flashMessage = { key: 'success', message: 'Remove User Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/mentor`)
    }
}