import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SubjectSubDetailContentService from '../../../services/v1/SubjectSubDetailContentService'
import appConfig from '../../../../../../config/app'

export default class SubjectSubDetailContentController {
    private subjectSubDetailContentService = new SubjectSubDetailContentService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,subject_sub_detail} = await this.subjectSubDetailContentService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail_content/index'), {
            datas,
            filter,
            paginate_data,
            subject_sub_detail_id: req.query.subject_sub_detail_id,
            subject_sub_detail,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {subject_sub_detail} = await this.subjectSubDetailContentService.create(req.query.subject_sub_detail_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail_content/create'), {
            subject_sub_detail,
            subject_sub_detail_id: req.query.subject_sub_detail_id,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectSubDetailContentService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Content Success.' }
            res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject_sub_detail_content/create?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,subject_sub_detail} = await this.subjectSubDetailContentService.edit(req.params.id, req.query.subject_sub_detail_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail_content/edit'), {
            data,
            subject_sub_detail,
            subject_sub_detail_id: req.query.subject_sub_detail_id,
            layout: './layouts/be/main'
        })
    }

    public async show(req: Request, res: Response) {
        const {data,subject_sub_detail} = await this.subjectSubDetailContentService.edit(req.params.id, req.query.subject_sub_detail_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail_content/show'), {
            data,
            subject_sub_detail,
            subject_sub_detail_id: req.query.subject_sub_detail_id,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectSubDetailContentService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Content Success.' }
            res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject_sub_detail_content/'+req.params.id+'/edit?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        }
    }

    public async order_up(req: Request, res: Response) {
        const result = await this.subjectSubDetailContentService.order_update(req.params.id, -1)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Order Up Fail.' }
            return res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Order Up Success.' }
        res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
    }

    public async order_down(req: Request, res: Response) {
        const result = await this.subjectSubDetailContentService.order_update(req.params.id, 1)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Order Down Fail.' }
            return res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Order Down Success.' }
        res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectSubDetailContentService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Content Fail.' }
            return res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Content Success.' }
        res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectSubDetailContentService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Content Success.' }
        res.redirect('/admin/v1/subject_sub_detail_content?subject_sub_detail_id='+req.query.subject_sub_detail_id)
    }
}