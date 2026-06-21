import path from 'path'
import oss, { ossConfig } from '../config/ossconfig'
import sharp from 'sharp'

class FileService {
    async uploadFile(fileName: string, fileContent: Buffer, is_public: boolean = false): Promise<string> {
        try {
            const ext = path.extname(fileName).toLowerCase().replace('.', '') // contoh: 'jpg'
            // basename TANPA ekstensi tapi TETAP menyertakan direktori (folder OSS),
            // mis. 'modules/media/editor/abc' — jangan pakai path.basename yang
            // membuang direktori (bikin file ter-upload ke root bucket).
            const dir = path.posix.dirname(fileName)
            const stem = path.basename(fileName, path.extname(fileName))
            const basename = dir === '.' ? stem : `${dir}/${stem}`

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

            // Catatan: TIDAK menyetel object ACL public-read — banyak bucket OSS
            // menolaknya ("Put public object acl is not allowed") bila Block Public
            // Access aktif. Akses publik ditangani via proxy route (presigned URL),
            // jadi bucket boleh tetap private. Parameter is_public dipertahankan
            // untuk kompatibilitas tetapi tak lagi mengubah ACL.
            await oss.put(finalName, finalBuffer)
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

    /**
     * Presigned URL OSS (TTL singkat) untuk satu objek. Dipakai proxy route yang
     * me-redirect (302) browser langsung ke OSS — bucket boleh tetap private.
     * Graceful: tanpa OSS → path lokal `public/`.
     */
    getSignedUrl(fileName: string, ttlSeconds: number = 600): string {
        if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
            return fileName.startsWith('/') ? fileName : `/${fileName}`
        }
        return oss.signatureUrl(fileName, { expires: ttlSeconds })
    }

    /**
     * Daftar file di bawah `prefix` (mis. folder editor). Dipakai file manager.
     * `urlFor` memetakan key → URL yang dipakai klien (mis. proxy route stabil).
     * Graceful: bila OSS belum dikonfigurasi → kembalikan array kosong.
     */
    async listFiles(prefix: string, urlFor?: (key: string) => string): Promise<{ name: string; url: string }[]> {
        if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
            return []
        }
        try {
            const res: any = await oss.list({ prefix, 'max-keys': 100 }, {})
            const objects = res?.objects || []
            return objects
                // Lewati marker folder (key === prefix atau berakhir '/').
                .filter((o: any) => o.name && o.name !== prefix && !o.name.endsWith('/'))
                .map((o: any) => ({ name: o.name, url: urlFor ? urlFor(o.name) : this.getFile(o.name) }))
        } catch (e) {
            console.error('List files error:', e)
            return []
        }
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
