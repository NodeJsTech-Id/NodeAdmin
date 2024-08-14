import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import appConfig from '../../../../../../config/app'
import NewsService from '../../../../../news/http/services/v1/NewsService'

export default class HomepageController {
    private newsService = new NewsService

    public async index(req: Request, res: Response) {
        const news = await (await this.newsService.index({ q_page_size: 24 })).datas
        res.render(path.resolve(Module.path, 'views'+appConfig.fe_view+'/index'), {
            news,
            layout: './layouts/fe/eduzone/main'
        })
    }
}