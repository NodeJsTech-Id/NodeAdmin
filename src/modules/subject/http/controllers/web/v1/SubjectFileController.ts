import { Request, Response } from 'express'
import SubjectFileService from '../../../services/v1/SubjectFileService'
import ResponseHandler from '../../../../../../ResponseHandler'

export default class SubjectFileController {
    private subjectFileService = new SubjectFileService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas} = await this.subjectFileService.index(req.params.subject_id, filter)
        return ResponseHandler.success(res, 'Success', {datas})
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.subjectFileService.store(req.params.subject_id, req.body, req.files)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            return ResponseHandler.success(res, 'Success', result)
        } catch (err: any) {
            return ResponseHandler.error(res, err.message)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.subjectFileService.delete(req.params.id)
        if (!result) {
            return ResponseHandler.error(res, 'Delete File Fail')
        }
        return ResponseHandler.success(res, 'Success')
    }
}