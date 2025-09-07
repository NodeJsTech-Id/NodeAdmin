import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import PermissionService from '../../../services/v1/PermissionService'
import { validationResult } from 'express-validator'
import { app } from '../../../../../../index'
import appConfig from '../../../../../../config/app'

export default class PermissionController {
    private permissionService = new PermissionService

    public async index(req: Request, res: Response) {
		await this.permissionService.getAllRegisteredRoute(app)
        const filter = req.query
        const {datas,paginate_data} = await this.permissionService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/permission/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/permission/create'), {
            layout: './layouts'+appConfig.be_layout+'/main'
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
                return res.redirect('/admin/v1/access/permission/create')
            }
            const result = await this.permissionService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Permission Success.' }
            res.redirect('/admin/v1/access/permission')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/access/permission/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.permissionService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/permission/edit'), {
            data,
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.session.errors = errors.array()
                return res.redirect('/admin/v1/access/permission/'+req.params.id+'/edit')
            }
            const result = await this.permissionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Permission Success.' }
            res.redirect('/admin/v1/access/permission')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/access/permission/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.permissionService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Permission Fail.' }
            return res.redirect('/admin/v1/access/permission')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Permission Success.' }
        res.redirect('/admin/v1/access/permission')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.permissionService.delete(id)
        });
        req.session.flashMessage = { key: 'success', message: 'Delete Permission Success.' }
        res.redirect('/admin/v1/access/permission')
    }
}
