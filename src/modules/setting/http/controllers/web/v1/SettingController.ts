import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import Module from '../../../../Module'
import { ISettingService } from '../../../services/v1/ISettingService'
import { TOKENS } from '../../../../../../tokens'
import { renderView } from '../../../../../../utils/view'

@injectable()
export default class SettingController {
    constructor(@inject(TOKENS.ISettingService) private settingService: ISettingService) {}

    public async index(req: Request, res: Response) {
        const {data} = await this.settingService.index()
        renderView(res, Module.path, 'index', { data })
    }

    public async update(req: Request, res: Response) {
        await this.settingService.update(req.body, req.files)
        req.session.flashMessage = { key: 'success', message: 'Save Setting Success.' }
        res.redirect('/admin/v1/setting')
    }
}