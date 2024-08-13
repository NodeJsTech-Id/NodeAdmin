import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import UserService from '../../../../../access/http/services/v1/UserService'
import { User } from '../../../../../access/models/user.entity'

export default class ProfileController {
    private userService = new UserService

    public async index(req: Request, res: Response) {
        const result = await this.userService.edit(req.params.id)
        const { data, roles } = result
        res.render(path.resolve(Module.path, 'views/be/profile'), {
            data,
            roles,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const user = req.user as User
            const result = await this.userService.update(user.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Profile Success.' }
            res.redirect('/admin/v1/dashboard')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/profile')
        }
    }
}