import { body } from 'express-validator'

export const permissionValidationRules = () => {
    let rule = [
        body('url').notEmpty().withMessage('Url is required'),
        body('status').notEmpty().withMessage('Status is required'),
        body('method').notEmpty().withMessage('Method is required'),
    ]

    return rule
}
