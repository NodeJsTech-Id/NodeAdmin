import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SubjectSubService from '../../../services/v1/SubjectSubService'
import appConfig from '../../../../../../config/app'

export default class SubjectSubController {
    private subjectSubService = new SubjectSubService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,subject} = await this.subjectSubService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub/index'), {
            datas,
            filter,
            paginate_data,
            subject,
            subject_id: req.query.subject_id,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {subject} = await this.subjectSubService.create(req.query.subject_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub/create'), {
            subject_id: req.query.subject_id,
            subject,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectSubService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub?subject_id='+req.query.subject_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject_sub/create?subject_id='+req.query.subject_id)
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,subject} = await this.subjectSubService.edit(req.params.id,req.query.subject_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub/edit'), {
            data,
            subject,
            subject_id: req.query.subject_id,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectSubService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub?subject_id='+req.query.subject_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject_sub/'+req.params.id+'/edit?subject_id='+req.query.subject_id)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectSubService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Subject Sub Fail.' }
            return res.redirect('/admin/v1/subject_sub?subject_id='+req.query.subject_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub?subject_id='+req.query.subject_id)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectSubService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub?subject_id='+req.query.subject_id)
    }
}