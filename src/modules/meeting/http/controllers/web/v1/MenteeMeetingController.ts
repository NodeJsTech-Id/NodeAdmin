import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import MeetingService from '../../../services/v1/MeetingService'
import appConfig from '../../../../../../config/app'

export default class MenteeMeetingController {
    private meetingService = new MeetingService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,rooms,classes,schedules,users} = await this.meetingService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mentee/meeting/index'), {
            datas,
            filter,
            paginate_data,
            rooms,
            classes,
            schedules,
            users,
            layout: './layouts/be/main'
        })
    }
}