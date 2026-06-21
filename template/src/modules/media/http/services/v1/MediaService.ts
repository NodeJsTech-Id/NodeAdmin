import { injectable } from 'tsyringe'
import crypto from 'crypto'
import fileService from '../../../../../services/fileService'
import Module from '../../../Module'
import { IMediaService } from './IMediaService'
import { AppError } from '@flazhost-nodeadmin/core'

@injectable()
export default class MediaService implements IMediaService {
    public async list(): Promise<{ name: string; url: string }[]> {
        return fileService.listFiles(Module.editorPrefix, true)
    }

    public async upload(file: Express.Multer.File): Promise<{ name: string; url: string; key: string }> {
        if (!file) {
            throw new AppError('File tidak ditemukan', 400)
        }
        const ext = (file.originalname.split('.').pop() || '').toLowerCase()
        const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
        const uploadPath = `${Module.editorPrefix}${unique}.${ext}`

        // uploadFile memvalidasi magic-byte (sharp) & konversi ke webp; SVG tak
        // di-allowlist sehingga aman dari SVG-XSS. is_public agar URL stabil.
        const savedName = await fileService.uploadFile(uploadPath, file.buffer, true)
        return {
            name: savedName.split('/').pop() || savedName,
            url: fileService.getFile(savedName, true),
            key: savedName,
        }
    }

    public async delete(key: string): Promise<void> {
        // Validasi key: hanya boleh di folder editor (anti path-traversal).
        if (!/^modules\/media\/editor\/[A-Za-z0-9._-]+$/.test(key)) {
            throw new AppError('Key tidak valid', 400)
        }
        await fileService.deleteFile(key)
    }
}
