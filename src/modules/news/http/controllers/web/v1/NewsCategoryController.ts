import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import NewsCategoryService from '../../../services/v1/NewsCategoryService'
import appConfig from '../../../../../../config/app'

export default class NewsCategoryController {
    private newsCategoryService = new NewsCategoryService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.newsCategoryService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/category/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/category/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.newsCategoryService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Category Success.' }
            res.redirect('/admin/v1/news/category')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/news/category/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.newsCategoryService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/category/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.newsCategoryService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Category Success.' }
            res.redirect('/admin/v1/news/category')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/news/category/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.newsCategoryService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Category Fail.' }
            return res.redirect('/admin/v1/news/category')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/news/category')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.newsCategoryService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/news/category')
    }
}