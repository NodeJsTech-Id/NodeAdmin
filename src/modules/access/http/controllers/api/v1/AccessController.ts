import { Request, Response } from 'express'
import AccessService from '../../../services/v1/AccessService'
import { validationResult } from 'express-validator'
import { app } from '../../../../../../index'
import ResponseHandler from '../../../../../../ResponseHandler'
import appConfig from '../../../../../../config/app'

export default class AccessController {
    private accessService = new AccessService

    public async index(req: Request, res: Response) {
		this.accessService.getAllRegisteredRoute(app)
        const filter = req.query
        const {datas,paginate_data} = await this.accessService.index(filter)
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
            const result = await this.accessService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success', result)
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.accessService.edit(req.params.id)
        const data = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return ResponseHandler.validationError(res, errors.array())
            }
            const result = await this.accessService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.accessService.delete(req.params.id)
        if (!result) {
            return ResponseHandler.error(res, 'Delete Access Fail')
        }
        return ResponseHandler.success(res, 'Success')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.accessService.delete(id)
        })
        return ResponseHandler.success(res, 'Success')
    }
}