import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import RoleService from '../../../services/v1/RoleService'
import ResponseHandler from '../../../../../../ResponseHandler'
import appConfig from '../../../../../../config/app'

export default class RoleController {
	private roleService = new RoleService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.roleService.index(filter)
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
            const result = await this.roleService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success', result)
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.roleService.edit(req.params.id)
        const data = result
        return ResponseHandler.success(res, 'Success', data)
    }

    public async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return ResponseHandler.validationError(res, errors.array())
            }
            const result = await this.roleService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.roleService.delete(req.params.id)
        if (!result) {
            return ResponseHandler.error(res, 'Delete Role Fail')
        }
        return ResponseHandler.success(res, 'Success')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.roleService.delete(id)
        })
        return ResponseHandler.success(res, 'Success')
    }

    public async access(req: Request, res: Response) {
        const filter = req.query
        const { datas, role, paginate_data } = await this.roleService.access(req.params.id,filter)
        return ResponseHandler.success(res, 'Success', {role,datas,paginate_data})
    }

    public async access_assign(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_assign(req.params.id, req.params.access_id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async access_assign_selected(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_assign_selected(req.params.id, req.body.selected)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async access_unassign(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_unassign(req.params.id, req.params.access_id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async access_unassign_selected(req: Request, res: Response) {
        try {
            const result = await this.roleService.access_unassign_selected(req.params.id, req.body.selected)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success')
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }
}