import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import UserService from '../../../services/v1/UserService'
import appConfig from '../../../../../../config/app'

export default class UserController {
    private userService = new UserService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const { datas, roles, paginate_data } = await this.userService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/users/index'), {
            datas,
            filter,
            roles,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const roles = await this.userService.create()
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/users/create'), {
            roles,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const result = await this.userService.store(req.body,req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store User Success.' }
            res.redirect('/admin/v1/access/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/access/user/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.userService.edit(req.params.id)
        const { data, roles } = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/users/edit'), {
            data,
            roles,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const result = await this.userService.update(req.params.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update User Success.' }
            res.redirect('/admin/v1/access/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/access/user/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.userService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete User Fail.' }
            return res.redirect('/admin/v1/access/user')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete User Success.' }
        res.redirect('/admin/v1/access/user')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.userService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete User Success.' }
        res.redirect('/admin/v1/access/user')
    }
}