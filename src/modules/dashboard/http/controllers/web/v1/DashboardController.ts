import { Request, Response } from 'express'
import { injectable } from 'tsyringe'
import Module from '../../../../Module'
import { renderView } from '../../../../../../utils/view'

@injectable()
export default class DashboardController {
    public async index(req: Request, res: Response) {
        renderView(res, Module.path, 'index')
    }
}
