import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'
import ResponseHandler from '../ResponseHandler'
import env from '../config/env'

/**
 * Error handler terpusat (4-arg, didaftarkan TERAKHIR di index.ts).
 * - AppError → statusCode + message-nya.
 * - Error lain → 500 generik (tanpa membocorkan detail/stack di production).
 * - Request /api/ → JSON via ResponseHandler; web → flash + redirect back.
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
    const isApp = err instanceof AppError
    const statusCode = isApp ? err.statusCode : 500
    const message = isApp ? err.message : 'Internal server error'

    // Log internal (selalu) — detail penuh hanya di server
    if (!isApp || statusCode >= 500) {
        console.error('[error]', err)
    }

    if (req.path.startsWith('/api/')) {
        return ResponseHandler.error(res, message, isApp ? err.details ?? null : null, statusCode)
    }

    // Web: simpan pesan ke flash lalu kembali ke halaman sebelumnya
    if (req.session) {
        ;(req.session as any).flashMessage = { key: 'error', message }
        ;(req.session as any).old = req.body
    }
    const back = req.get('Referer') || '/'
    return res.redirect(back)
}
