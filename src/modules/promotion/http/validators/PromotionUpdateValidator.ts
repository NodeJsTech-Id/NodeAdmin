import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import ResponseHandler from '../../../../ResponseHandler'

const userSchema: ObjectSchema = Joi.object({
    code: Joi.string().required(),
    desc: Joi.string().allow("").optional(),
    discount_percent_status: Joi.string().allow("Active","Inactive").required(),
    discount_percent: Joi.number().allow(0).optional(),
    discount_amount_status: Joi.string().allow("Active","Inactive").required(),
    discount_amount: Joi.number().allow(0).optional(),
    period_type: Joi.string().allow("Unlimited","Limited").required(),
    period_start: Joi.string().required(),
    period_end: Joi.string().required(),
    number: Joi.number().required(),
})

const PromotionUpdateValidator = (req: Request, res: Response, next: NextFunction): void => {
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

export { PromotionUpdateValidator }
