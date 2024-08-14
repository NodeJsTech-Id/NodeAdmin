import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import AccessService from '../../../services/v1/AccessService'
import { validationResult } from 'express-validator'
import { app } from '../../../../../../index'
import appConfig from '../../../../../../config/app'

export default class AccessController {
    private accessService = new AccessService

    public async index(req: Request, res: Response) {
		this.accessService.getAllRegisteredRoute(app)
        const filter = req.query
        const {datas,paginate_data} = await this.accessService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/accesses/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/accesses/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            if (!req.body.blocked) {
                req.body.blocked = false
            }
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.session.errors = errors.array()
                req.session.old = req.body
                return res.redirect('/admin/v1/access/access/create')
            }
            const result = await this.accessService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Access Success.' }
            res.redirect('/admin/v1/access/access')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/access/access/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.accessService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/accesses/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.session.errors = errors.array()
                return res.redirect('/admin/v1/access/access/'+req.params.id+'/edit')
            }
            const result = await this.accessService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Access Success.' }
            res.redirect('/admin/v1/access/access')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/access/access/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.accessService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Access Fail.' }
            return res.redirect('/admin/v1/access/access')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Access Success.' }
        res.redirect('/admin/v1/access/access')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.accessService.delete(id)
        });
        req.session.flashMessage = { key: 'success', message: 'Delete Access Success.' }
        res.redirect('/admin/v1/access/access')
    }
}