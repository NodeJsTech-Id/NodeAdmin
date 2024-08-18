import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { clientRedis } from '../../../..'
import ResponseHandler from '../../../../ResponseHandler'

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/auth/login')
}

export const ensureAuthenticatedApi = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
        return ResponseHandler.error(res, "No token provided", null, 401)
    }
    const checkToken = await clientRedis.get(token)
    if (checkToken == 'blacklisted') return ResponseHandler.error(res, "Unauthenticated", null, 401)
    jwt.verify(token, process.env.KELASCENDIKIA_JWT_SECRET || 'secret', (err, decoded) => {
        if (err) {
            return ResponseHandler.error(res, "Unauthenticated", null, 401)
        }
        req.user = decoded
        next()
    })
}