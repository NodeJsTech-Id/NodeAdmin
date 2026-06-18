import { Request, Response, NextFunction } from 'express'
import { container } from '../container'

type Ctor<T> = new (...args: any[]) => T

/**
 * Bind method controller secara LAZY: controller di-resolve dari container
 * per-request (setelah DataSource init), method dipanggil, dan error apa pun
 * (sync/async) diteruskan ke errorHandler via next().
 *
 * Pengganti pola lama `new Controller()` + `.bind(controller)` di route.
 */
export function handler<T>(Ctrl: Ctor<T>, method: keyof T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const instance = container.resolve(Ctrl) as any
            return Promise.resolve(instance[method](req, res, next)).catch(next)
        } catch (err) {
            return next(err)
        }
    }
}
