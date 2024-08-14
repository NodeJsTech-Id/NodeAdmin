import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import NewsService from '../../../services/v1/NewsService'
import appConfig from '../../../../../../config/app'

export default class NewsController {
    private categoryService = new NewsService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const { datas,paginate_data, categories } = await this.categoryService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/news/index'), {
            datas,
            categories,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const { categories } = await this.categoryService.create()
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/news/create'), {
            categories,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.categoryService.store(req.body,req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store News Success.' }
            res.redirect('/admin/v1/news')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/news/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const { data, categories } = await this.categoryService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/news/edit'), {
            data,
            categories,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.categoryService.update(req.params.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update News Success.' }
            res.redirect('/admin/v1/news')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/news/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.categoryService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete News Fail.' }
            return res.redirect('/admin/v1/news')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete News Success.' }
        res.redirect('/admin/v1/news')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.categoryService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete News Success.' }
        res.redirect('/admin/v1/news')
    }

    public async show(req: Request, res: Response) {
        try {
            const result = await this.categoryService.show(req.params.slug)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            const { data, news, categories } = result
            res.render(path.resolve(Module.path, 'views'+appConfig.fe_view+'/news/news_detail'), {
                data,
                news,
                categories,
                layout: './layouts/fe/eduzone/main'
            })
        } catch (err: any) {
            res.render(path.resolve('./src/resources/layouts/fe/eduzone/error-404'), {
                layout: './layouts/fe/eduzone/main'
            })
        }
    }
}