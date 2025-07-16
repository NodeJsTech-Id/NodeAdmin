import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'
import appConfig from '../../../../../../config/app'
import SubjectSubDetailContentService from '../../../../../subject/http/services/v1/SubjectSubContentService'
import { User } from '../../../../../access/models/user.entity'

export default class MentorClassController {
    private classService = new ClassService
    private subjectSubDetailContentService = new SubjectSubDetailContentService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const user = req.user as User
        filter.q_mentor = user.id
        const {datas,paginate_data} = await this.classService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentorView/class/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async index_subject(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_subject(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentorView/subject/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async show_content(req: Request, res: Response) {
        const {data} = await this.subjectSubDetailContentService.edit(req.params.content_id, req.query.subject_sub_detail_id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentorView/subject/show'), {
            data,
            class_id: req.params.id,
            layout: './layouts/be/main'
        })
    }

    public async index_user(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_user(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentorView/user/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async index_mentor(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_mentor(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentorView/mentor/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }
}