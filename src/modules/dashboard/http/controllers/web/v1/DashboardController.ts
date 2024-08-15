import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import appConfig from '../../../../../../config/app'

export default class UserController {
    public async index(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/index'), {
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }
}