import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import UserProfileService from '../../../services/v1/UserProfileService'

export default class UserProfileController {
	private userProfileService = new UserProfileService

    public async index(req: Request, res: Response) {
        const {data,user,professions} = await this.userProfileService.index(req.params.user_id)
        res.render(path.resolve(Module.path, 'views/be/sb/user_profile/edit'), {
            data,
            user,
            professions,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.userProfileService.update(req.params.user_id,req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update User Profile Success.' }
            res.redirect('/admin/v1/access/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/access/'+req.params.user_id+'/userProfile')
        }
    }
}