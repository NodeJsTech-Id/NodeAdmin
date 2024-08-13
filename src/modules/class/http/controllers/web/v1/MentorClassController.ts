import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'

export default class MentorClassController {
    private classService = new ClassService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.classService.index(filter)
        res.render(path.resolve(Module.path, 'views/be/mentorView/class/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async index_subject(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_subject(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views/be/mentorView/subject/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async index_user(req: Request, res: Response) {
        const filter = req.query
        const {classData,datas,paginate_data} = await this.classService.index_user(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views/be/mentorView/user/index'), {
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
        res.render(path.resolve(Module.path, 'views/be/mentorView/mentor/index'), {
            classData,
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }
}