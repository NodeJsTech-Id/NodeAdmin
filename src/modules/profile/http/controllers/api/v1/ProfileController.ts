import { Request, Response } from 'express'
import UserService from '../../../../../access/http/services/v1/UserService'
import ResponseHandler from '../../../../../../ResponseHandler'
import { User } from '../../../../../access/models/user.entity'
import appConfig from '../../../../../../config/app'

export default class ProfileController {
    private userService = new UserService

    public async index(req: Request, res: Response) {
        const result = await this.userService.edit(req.params.id)
        const { data, roles } = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const user = req.user as User
            const result = await this.userService.update(user.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }
}