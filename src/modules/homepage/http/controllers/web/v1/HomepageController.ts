import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import appConfig from '../../../../../../config/app'
import NewsService from '../../../../../news/http/services/v1/NewsService'
import HomepageMenuService from '../../../services/v1/HomepageMenuService'

export default class HomepageController {
    private newsService = new NewsService
    private homepageMenuService = new HomepageMenuService

    public async index(req: Request, res: Response) {
        const news = await (await this.newsService.index({ q_page_size: 24 })).datas
        const mainMenus = await (await this.homepageMenuService.index({ q_page_size: 1000, q_position: "Main" })).datas
        res.render(path.resolve(Module.path, 'views'+appConfig.fe_view+'/index'), {
            news,
            mainMenus,
            layout: './layouts/fe/eduzone/main'
        })
    }
}