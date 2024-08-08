import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SubjectSubService from '../../../services/v1/SubjectSubService'

export default class SubjectSubController {
    private subjectSubService = new SubjectSubService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,subjects} = await this.subjectSubService.index(filter)
        res.render(path.resolve(Module.path, 'views/subject_sub/index'), {
            datas,
            filter,
            paginate_data,
            subjects,
            layout: './layouts/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {subjects} = await this.subjectSubService.create()
        res.render(path.resolve(Module.path, 'views/subject_sub/create'), {
            subjects,
            layout: './layouts/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectSubService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject_sub/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,subjects} = await this.subjectSubService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views/subject_sub/edit'), {
            data,
            subjects,
            layout: './layouts/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectSubService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject_sub/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectSubService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Subject Sub Fail.' }
            return res.redirect('/admin/v1/subject_sub')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectSubService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub')
    }
}