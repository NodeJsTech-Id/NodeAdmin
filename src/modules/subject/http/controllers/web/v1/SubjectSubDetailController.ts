import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SubjectSubDetailService from '../../../services/v1/SubjectSubDetailService'
import appConfig from '../../../../../../config/app'

export default class SubjectSubDetailController {
    private subjectSubDetailService = new SubjectSubDetailService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,subject_sub} = await this.subjectSubDetailService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail/index'), {
            datas,
            filter,
            paginate_data,
            subject_sub,
            subject_sub_id: req.query.subject_sub_id,
            subject_id: req.query.subject_id,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {subject_sub} = await this.subjectSubDetailService.create(req.query.subject_sub_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail/create'), {
            subject_sub_id: req.query.subject_sub_id,
            subject_id: req.query.subject_id,
            subject_sub,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectSubDetailService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub_detail?subject_sub_id='+req.query.subject_sub_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/subject_sub_detail/create?subject_sub_id='+req.query.subject_sub_id)
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,subject_sub} = await this.subjectSubDetailService.edit(req.params.id, req.query.subject_sub_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject_sub_detail/edit'), {
            data,
            subject_sub_id: req.query.subject_sub_id,
            subject_id: req.query.subject_id,
            subject_sub,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.subjectSubDetailService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Subject Sub Success.' }
            res.redirect('/admin/v1/subject_sub_detail?subject_sub_id='+req.query.subject_sub_id)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/subject_sub_detail/'+req.params.id+'/edit?subject_sub_id='+req.query.subject_sub_id)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectSubDetailService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Subject Sub Fail.' }
            return res.redirect('/admin/v1/subject_sub_detail?subject_sub_id='+req.query.subject_sub_id)
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub_detail?subject_sub_id='+req.query.subject_sub_id)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.subjectSubDetailService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Subject Sub Success.' }
        res.redirect('/admin/v1/subject_sub_detail?subject_sub_id='+req.query.subject_sub_id)
    }
}