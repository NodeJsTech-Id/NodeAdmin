import path from 'path'
import oss, { ossConfig } from '../config/ossconfig'
import sharp from 'sharp'

class FileService {
    async uploadFile(fileName: string, fileContent: Buffer, is_public: boolean = false): Promise<string> {
        try {
            const ext = path.extname(fileName).toLowerCase().replace('.', '') // contoh: 'jpg'
            const basename = path.basename(fileName, path.extname(fileName))

            // Validasi magic-byte: pastikan konten benar-benar gambar (bukan hanya MIME
            // dari klien yang bisa dipalsukan). sharp akan throw bila bukan gambar valid.
            const ALLOWED = ['jpg', 'jpeg', 'png', 'tiff', 'bmp', 'webp', 'gif']
            if (!ALLOWED.includes(ext)) {
                throw new Error('Ekstensi file tidak diizinkan')
            }
            const meta = await sharp(fileContent).metadata()
            if (!meta.format) {
                throw new Error('File bukan gambar yang valid')
            }

            const isConvertible = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(ext)
            let finalBuffer = fileContent
            let finalName = fileName

            if (isConvertible) {
                finalBuffer = await sharp(fileContent).webp({ quality: 80 }).toBuffer()
                finalName = `${basename}.webp`
            }

            const uploadOptions: any = {}
            if (is_public) {
                uploadOptions.headers = { 'x-oss-object-acl': 'public-read' }
            }

            await oss.put(finalName, finalBuffer, uploadOptions)
            return finalName
        } catch (e) {
            console.error('Upload/Convert error:', e)
            throw e
        }
    }

    getFile(fileName: string, is_public: boolean = false): any {
        // Graceful degradation: bila OSS belum dikonfigurasi (mis. environment
        // dev/coba tanpa kredensial), jangan crash render view — sajikan path
        // lokal dari folder `public/` (di-serve statis). Upload tetap butuh OSS.
        if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
            return fileName.startsWith('/') ? fileName : `/${fileName}`
        }
        if (is_public) {
            const { bucket, endpoint, secure } = ossConfig
            const protocol = secure ? 'https' : 'http'
            return `${protocol}://${bucket}.${endpoint}/${fileName}`
        }
        // Tanpa cache-bust Date.now(): signed URL sudah punya expiry,
        // browser boleh meng-cache gambar identik antar-render.
        return oss.signatureUrl(fileName, { expires: 3600 * 6 })
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
