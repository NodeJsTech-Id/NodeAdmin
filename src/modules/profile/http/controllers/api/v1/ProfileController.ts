import { Request, Response } from 'express'
import UserService from '../../../../../access/http/services/v1/UserService'
import ResponseHandler from '../../../../../../ResponseHandler'
import { User } from '../../../../../access/models/user.entity'

export default class ProfileController {
    private userService = new UserService

    public async index(req: Request, res: Response) {
        const user = req.user as User
        const result = await this.userService.edit(user.id)
        const { data, roles } = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            const user = req.user as User
            const result = await this.userService.updateProfile(user.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }
}
