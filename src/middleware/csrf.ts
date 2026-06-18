import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

/**
 * Proteksi CSRF sederhana (synchronizer token pattern) tanpa dependency tambahan.
 * - Token disimpan di session, diekspos ke view via res.locals.csrfToken.
 * - Request mutasi (POST/PUT/DELETE/PATCH) wajib menyertakan token yang cocok
 *   lewat field `_csrf` (body) atau header `x-csrf-token`.
 * - Enduser API (Bearer JWT, prefix /api/) dilewati — stateless, tak pakai cookie session.
 */

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS'])

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Pastikan token ada di session
    if (!req.session) return next()
    if (!(req.session as any).csrfToken) {
        (req.session as any).csrfToken = crypto.randomBytes(32).toString('hex')
    }
    const token = (req.session as any).csrfToken
    res.locals.csrfToken = token

    // API stateless (JWT) tidak perlu CSRF
    if (req.path.startsWith('/api/')) return next()

    if (SAFE.has(req.method)) return next()

    const sent = (req.body && req.body._csrf) || req.headers['x-csrf-token']
    if (sent && typeof sent === 'string' && sent.length === token.length &&
        crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(token))) {
        return next()
    }
    return res.status(403).send('Invalid CSRF token')
}
