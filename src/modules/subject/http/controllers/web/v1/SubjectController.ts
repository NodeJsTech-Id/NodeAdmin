import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SubjectService from '../../../services/v1/SubjectService'

export default class SubjectController {
    private subjectService = new SubjectService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,categories} = await this.subjectService.index(filter)
        res.render(path.resolve(Module.path, 'views/be/subject/index'), {
            datas,
            filter,
            paginate_data,
            categories,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const categories = await this.subjectService.create()
        res.render(path.resolve(Module.path, 'views/be/subject/create'), {
            categories,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Subject Success.' }
            res.redirect('/admin/v1/subject')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const { data, categories } = await this.subjectService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views/be/subject/edit'), {
            data,
            categories,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Subject Success.' }
            res.redirect('/admin/v1/subject')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Subject Fail.' }
            return res.redirect('/admin/v1/subject')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Success.' }
        res.redirect('/admin/v1/subject')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Success.' }
        res.redirect('/admin/v1/subject')
    }
}