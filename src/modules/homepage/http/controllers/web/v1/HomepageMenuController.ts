import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import appConfig from '../../../../../../config/app'
import HomepageMenuService from '../../../services/v1/HomepageMenuService'

export default class HomepageMenuController {
    private homepageMenuService = new HomepageMenuService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.homepageMenuService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/menus/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const { menus } = await this.homepageMenuService.create()
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/menus/create'), {
            menus,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.homepageMenuService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Category Success.' }
            res.redirect('/admin/v1/homepage/menu')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/homepage/menu/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const { data, menus } = await this.homepageMenuService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/menus/edit'), {
            data,
            menus,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.homepageMenuService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Category Success.' }
            res.redirect('/admin/v1/homepage/menu')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/homepage/menu/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.homepageMenuService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Category Fail.' }
            return res.redirect('/admin/v1/homepage/menu')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/homepage/menu')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.homepageMenuService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Category Success.' }
        res.redirect('/admin/v1/homepage/menu')
    }
}