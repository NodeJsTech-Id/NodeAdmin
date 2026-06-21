import { Request, Response } from 'express'
import { injectable, inject } from 'tsyringe'
import { ResponseHandler, AppError } from '@flazhost-nodeadmin/core'
import { IMediaService } from '../../../services/v1/IMediaService'
import { TOKENS } from '../../../../../../tokens'

/**
 * File manager untuk rich text editor (Trumbowyg). Endpoint AJAX di jalur web
 * (session + CSRF), bukan /api. Karena errorHandler core me-redirect error di
 * jalur web (bukan JSON), controller ini menangani error sendiri → selalu JSON.
 */
@injectable()
export default class MediaController {
    constructor(@inject(TOKENS.IMediaService) private mediaService: IMediaService) {}

    private static handle(res: Response, e: any) {
        const status = e instanceof AppError ? e.statusCode : 500
        const message = e instanceof AppError ? e.message : 'Terjadi kesalahan'
        return ResponseHandler.error(res, message, null, status)
    }

    public async list(req: Request, res: Response) {
        try {
            const data = await this.mediaService.list()
            return ResponseHandler.success(res, 'Daftar file', data)
        } catch (e) { return MediaController.handle(res, e) }
    }

    public async upload(req: Request, res: Response) {
        try {
            const data = await this.mediaService.upload((req as any).file)
            return ResponseHandler.success(res, 'File diunggah', data, 201)
        } catch (e) { return MediaController.handle(res, e) }
    }

    public async destroy(req: Request, res: Response) {
        try {
            await this.mediaService.delete(req.body.key)
            return ResponseHandler.success(res, 'File dihapus', null)
        } catch (e) { return MediaController.handle(res, e) }
    }
}
