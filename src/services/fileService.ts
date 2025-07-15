import path from 'path'
import oss, { ossConfig } from '../config/ossconfig'
import sharp from 'sharp'

class FileService {
    async uploadFile(fileName: string, fileContent: Buffer, is_public: boolean = false): Promise<any> {
        try {
            const ext = path.extname(fileName).toLowerCase().replace('.', '') // contoh: 'jpg'
            const basename = path.basename(fileName, path.extname(fileName))
            const isConvertible = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(ext)

            let finalBuffer = fileContent
            let finalName = fileName

            if (isConvertible) {
                finalBuffer = await sharp(fileContent).webp({ quality: 80 }).toBuffer()
                finalName = `${basename}.webp`
            }

            let result
            if (is_public) {
                result = await oss.put(finalName, finalBuffer, {
                    headers: {
                        'x-oss-object-acl': 'public-read'
                    }
                })
            } else {
                result = await oss.put(finalName, finalBuffer)
            }
            return result
        } catch (e) {
            console.error('Upload/Convert error:', e)
            return e
        }
    }

    getFile(fileName: string, is_public: boolean = false): any {
        const version = Date.now()
        if (is_public) {
            const { bucket, endpoint, secure } = ossConfig
            const protocol = secure ? 'https' : 'http'
            return `${protocol}://${bucket}.${endpoint}/${fileName}`
        }
        let url = oss.signatureUrl(fileName, {
            expires: 3600 * 6,
        })
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}v=${version}`
    }

    async deleteFile(fileName: string): Promise<any> {
        try {
            const result = await oss.delete(fileName)
            return result
        } catch (e) {
            return e
        }
    }
}

export default new FileService()
