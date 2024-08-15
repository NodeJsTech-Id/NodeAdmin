import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import { validationResult } from 'express-validator'
import RoleService from '../../../services/v1/RoleService'
import appConfig from '../../../../../../config/app'

export default class RoleController {
	private roleService = new RoleService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.roleService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/roles/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/roles/create'), {
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
                return res.redirect('/admin/v1/access/role/create')
            }
            const result = await this.roleService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Role Success.' }
            res.redirect('/admin/v1/access/role')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/access/role/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.roleService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/roles/edit'), {
            data,
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.session.errors = errors.array()
                return res.redirect('/admin/v1/access/role/'+req.params.id+'/edit')
            }
            const result = await this.roleService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Role Success.' }
            res.redirect('/admin/v1/access/role')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/access/role/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.roleService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Role Fail.' }
            return res.redirect('/admin/v1/access/role')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Role Success.' }
        res.redirect('/admin/v1/access/role')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.roleService.delete(id)
        });
        req.session.flashMessage = { key: 'success', message: 'Delete Role Success.' }
        res.redirect('/admin/v1/access/role')
    }

    public async access(req: Request, res: Response) {
        const filter = req.query
        const { datas, role, paginate_data } = await this.roleService.access(req.params.id,filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/roles/access'), {
            role,
            datas,
            filter,
            paginate_data,
            layout: './layouts'+appConfig.be_layout+'/main'
        })
    }

    public async access_assign(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_assign(req.params.id, req.params.access_id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Assign Access Success.' }
            return res.redirect('back')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('back')
        }
    }

    public async access_assign_selected(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_assign_selected(req.params.id, req.body.selected)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Assign Access Success.' }
            return res.redirect('back')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('back')
        }
    }

    public async access_unassign(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_unassign(req.params.id, req.params.access_id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Unassign Access Success.' }
            return res.redirect('back')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('back')
        }
    }

    public async access_unassign_selected(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_unassign_selected(req.params.id, req.body.selected)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Unassign Access Success.' }
            return res.redirect('back')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('back')
        }
    }
}