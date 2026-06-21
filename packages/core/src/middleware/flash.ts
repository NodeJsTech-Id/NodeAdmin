import { Request, Response, NextFunction } from 'express'

// Augmentasi tipe Express (menggantikan @types/connect-flash yang dibuang).
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            flash(type: string, msg: string | string[]): number
            flash(type: string): string[]
            flash(): Record<string, string[]>
        }
    }
}

/**
 * Pengganti `connect-flash` (lib tak terawat sejak 2014 yang memakai
 * `util.isArray` → memicu DEP0044). Implementasi minimal & kompatibel-API:
 * pesan flash disimpan per-tipe di `req.session.flash`, hidup satu request-cycle
 * (di-set lalu di-consume saat dibaca).
 *
 * API (subset yang dipakai):
 *   req.flash(type, msg)   → antrekan pesan, kembalikan jumlah antrean type
 *   req.flash(type, [...]) → antrekan banyak pesan
 *   req.flash(type)        → ambil & kosongkan antrean type (array)
 *   req.flash()            → ambil & kosongkan seluruh antrean (object)
 */
type FlashStore = Record<string, string[]>

function _flash(this: Request, type?: string, msg?: string | string[]): any {
    const session = this.session as any
    if (session === undefined) throw new Error('req.flash() requires sessions')
    const msgs: FlashStore = session.flash = session.flash || {}

    if (type && msg !== undefined) {
        const bucket = msgs[type] = msgs[type] || []
        if (Array.isArray(msg)) {
            for (const val of msg) bucket.push(val)
        } else {
            bucket.push(msg)
        }
        return bucket.length
    } else if (type) {
        const arr = msgs[type]
        delete msgs[type]
        return arr || []
    } else {
        session.flash = {}
        return msgs
    }
}

/** Middleware: pasang `req.flash` (idempotent — tak menimpa bila sudah ada). */
export function flash() {
    return function (req: Request, _res: Response, next: NextFunction) {
        if (typeof (req as any).flash === 'function') return next()
        ;(req as any).flash = _flash
        next()
    }
}

export default flash
