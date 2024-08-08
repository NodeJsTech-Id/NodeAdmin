import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import ResponseHandler from '../../../../ResponseHandler'

const userSchema: ObjectSchema = Joi.object({
    name: Joi.string().required(),
    desc: Joi.string().allow("").optional(),
})

const RoomUpdateValidator = (req: Request, res: Response, next: NextFunction): void => {
    let errorTotal: any[] = []

    const { error } = userSchema.validate(req.body, { abortEarly: false })
    if (error) {
        const errors = error.details.map(detail => ({
            path: detail.context?.key,
            msg: detail.message,
        }))
        errorTotal = errors
    }

    if (req.url.includes('/api/')) {
        if (errorTotal.length > 0) {
            return ResponseHandler.validationError(res, errorTotal)
        }
    } else {
        if (errorTotal.length > 0) {
            req.session.errors = errorTotal
            req.session.old = req.body
            return res.redirect('back')
        }
    }

    next()
}

export { RoomUpdateValidator }
