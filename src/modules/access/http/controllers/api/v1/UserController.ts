import { Request, Response } from 'express'
import UserService from '../../../services/v1/UserService'
import ResponseHandler from '../../../../../../ResponseHandler'

export default class UserController {
    private userService = new UserService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const { datas, roles, paginate_data } = await this.userService.index(filter)
        return ResponseHandler.success(res, 'Success', {datas,paginate_data})
    }

    public async store(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const result = await this.userService.store(req.body,req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success', result)
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.userService.edit(req.params.id)
        const { data, roles } = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            req.body.blocked = (!req.body.blocked) ? false : true
            const result = await this.userService.update(req.params.id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.userService.delete(req.params.id)
        if (!result) {
            return ResponseHandler.error(res, 'Delete User Fail')
        }
        return ResponseHandler.success(res, 'Success')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.userService.delete(id)
        });
        return ResponseHandler.success(res, 'Success')
    }
}