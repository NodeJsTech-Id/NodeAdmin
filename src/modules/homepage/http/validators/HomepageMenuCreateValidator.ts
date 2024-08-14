import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import ResponseHandler from '../../../../ResponseHandler'

const userSchema: ObjectSchema = Joi.object({
    menu_id: Joi.string().allow("").optional(),
    position: Joi.string().required(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    target: Joi.string().required(),
    status: Joi.string().required(),
    level: Joi.number().required(),
})

const HomepageMenuCreateValidator = (req: Request, res: Response, next: NextFunction): void => {
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

export { HomepageMenuCreateValidator }
