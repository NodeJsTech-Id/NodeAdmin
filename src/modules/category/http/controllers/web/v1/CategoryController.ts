import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import CategoryService from '../../../services/v1/CategoryService'

export default class CategoryController {
    private categoryService = new CategoryService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.categoryService.index(filter)
        res.render(path.resolve(Module.path, 'views/category/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views/category/create'), {
            layout: './layouts/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.categoryService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Category Success.' }
            res.redirect('/admin/v1/category')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/category/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.categoryService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views/category/edit'), {
            data,
            layout: './layouts/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.categoryService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Category Success.' }
            res.redirect('/admin/v1/category')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/category/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.categoryService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Category Fail.' }
            return res.redirect('/admin/v1/category')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/category')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.categoryService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/category')
    }
}