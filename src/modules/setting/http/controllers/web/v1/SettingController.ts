import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import SettingService from '../../../services/v1/SettingService'

export default class SettingController {
    private settingService = new SettingService

    public async index(req: Request, res: Response) {
        const {data} = await this.settingService.index()
        res.render(path.resolve(Module.path, 'views/be/index'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.settingService.update(req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Save Setting Success.' }
            res.redirect('/admin/v1/setting')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/setting')
        }
    }
}