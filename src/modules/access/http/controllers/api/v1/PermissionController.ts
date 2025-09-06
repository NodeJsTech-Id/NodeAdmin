import { Request, Response } from 'express'
import PermissionService from '../../../services/v1/PermissionService'
import { validationResult } from 'express-validator'
import { app } from '../../../../../../index'
import ResponseHandler from '../../../../../../ResponseHandler'

export default class PermissionController {
    private permissionService = new PermissionService

    public async index(req: Request, res: Response) {
		this.permissionService.getAllRegisteredRoute(app)
        const filter = req.query
        const {datas,paginate_data} = await this.permissionService.index(filter)
        return ResponseHandler.success(res, 'Success', {datas,paginate_data})
    }

    public async store(req: Request, res: Response) {
        try {
            if (!req.body.blocked) {
                req.body.blocked = false
            }
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return ResponseHandler.validationError(res, errors.array())
            }
            const result = await this.permissionService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success', result)
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.permissionService.edit(req.params.id)
        const data = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return ResponseHandler.validationError(res, errors.array())
            }
            const result = await this.permissionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.permissionService.delete(req.params.id)
        if (!result) {
        return ResponseHandler.error(res, 'Delete Permission Fail')
        }
        return ResponseHandler.success(res, 'Success')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.permissionService.delete(id)
        });
        return ResponseHandler.success(res, 'Success')
    }
}
