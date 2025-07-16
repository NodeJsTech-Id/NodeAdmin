import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import appConfig from '../../../../../../config/app'
import SubjectSubContentService from '../../../services/v1/SubjectSubContentService'

export default class SubjectSubContentController {
    private subjectSubContentService = new SubjectSubContentService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,subject_sub} = await this.subjectSubContentService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_content/index'), {
            datas,
            filter,
            paginate_data,
            subject_sub_id: req.query.subject_sub_id,
            subject_sub,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {subject_sub} = await this.subjectSubContentService.create(req.query.subject_sub_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_content/create'), {
            subject_sub,
            subject_sub_id: req.query.subject_sub_id,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectSubContentService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Content Success.' }
            res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject_sub_content/create?subject_sub_id='+req.query.subject_sub_id)
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,subject_sub} = await this.subjectSubContentService.edit(req.params.id, req.query.subject_sub_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_content/edit'), {
            data,
            subject_sub,
            subject_sub_id: req.query.subject_sub_id,
            layout: './layouts/be/main'
        })
    }

    public async show(req: Request, res: Response) {
        const {data,subject_sub} = await this.subjectSubContentService.edit(req.params.id, req.query.subject_sub_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_content/show'), {
            data,
            subject_sub,
            subject_sub_id: req.query.subject_sub_id,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectSubContentService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Content Success.' }
            res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject_sub_content/'+req.params.id+'/edit?subject_sub_id='+req.query.subject_sub_id)
        }
    }

    public async order_up(req: Request, res: Response) {
        const result = await this.subjectSubContentService.order_update(req.params.id, -1)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Order Up Fail.' }
            return res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Order Up Success.' }
        res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
    }

    public async order_down(req: Request, res: Response) {
        const result = await this.subjectSubContentService.order_update(req.params.id, 1)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Order Down Fail.' }
            return res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Order Down Success.' }
        res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectSubContentService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Content Fail.' }
            return res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Content Success.' }
        res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectSubContentService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Content Success.' }
        res.redirect('/admin/v1/subject_sub_content?subject_sub_id='+req.query.subject_sub_id)
    }
}