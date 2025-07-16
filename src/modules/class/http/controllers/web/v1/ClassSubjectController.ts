import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'
import appConfig from '../../../../../../config/app'
import SubjectSubDetailContentService from '../../../../../subject/http/services/v1/SubjectSubContentService'

export default class ClassSubjectController {
    private classService = new ClassService
    private subjectSubDetailContentService = new SubjectSubDetailContentService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_subject(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async show_content(req: Request, res: Response) {
        const {data} = await this.subjectSubDetailContentService.edit(req.params.content_id, req.query.subject_sub_detail_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject/show'), {
            data,
            class_id: req.params.id,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {classData,subjects} = await this.classService.create_subject(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/subject/create'), {
            classData,
            subjects,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.classService.store_subject(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Add Subject Success.' }
            res.redirect(`/admin/v1/class/${req.params.id}/subject`)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect(`/admin/v1/class/${req.params.id}/subject/create`)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.classService.delete_subject(req.params.id,req.params.subject_id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Remove Subject Fail.' }
            res.redirect(`/admin/v1/class/${req.params.id}/subject`)
        }
        req.session.flashMessage = { key: 'success', message: 'Remove Subject Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/subject`)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.classService.delete_subject(req.params.id,id)
        })
        req.session.flashMessage = { key: 'success', message: 'Remove Subject Success.' }
        res.redirect(`/admin/v1/class/${req.params.id}/subject`)
    }
}