import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import ResponseHandler from '../../../../ResponseHandler'

const validator: ObjectSchema = Joi.object({
    user_id: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string().allow("Education","Company").required(),
    code: Joi.string().allow("").optional(),
    refferal: Joi.string().allow("").optional(),
    address: Joi.string().allow("").optional(),
    status: Joi.string().allow("Active","Inactive").required(),
})

const InstitutionCreateValidator = (req: Request, res: Response, next: NextFunction): void => {
    let errorTotal: any[] = []

    const { error } = validator.validate(req.body, { abortEarly: false })
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

export { InstitutionCreateValidator }
