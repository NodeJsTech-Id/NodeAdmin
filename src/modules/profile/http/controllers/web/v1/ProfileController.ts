import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import UserService from '../../../../../access/http/services/v1/UserService'
import { User } from '../../../../../access/models/user.entity'
import appConfig from '../../../../../../config/app'
import UserProfileService from '../../../../../access/http/services/v1/UserProfileService'

export default class ProfileController {
    private userService = new UserService
    private userProfileService = new UserProfileService

    public async index(req: Request, res: Response) {
        const user = req.user as User
        const result = await this.userService.edit(user.id)
        const { data, roles } = result
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/profile'), {
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

    public async profile_index(req: Request, res: Response) {
        const auth = req.user as User
        const {data,user,professions} = await this.userProfileService.index(auth.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/user_profile'), {
            data,
            user,
            professions,
            layout: './layouts/be/main'
        })
    }

    public async profile_update(req: Request, res: Response) {
        try {
            const user = req.user as User
            const result = await this.userProfileService.update(user.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update User Profile Success.' }
            res.redirect('/admin/v1/dashboard')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/userprofile')
        }
    }
}