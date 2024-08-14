import { Request, Response, NextFunction } from 'express'
import Joi, { ObjectSchema } from 'joi'
import multer, { FileFilterCallback } from 'multer'
import ResponseHandler from '../../../../ResponseHandler'
import app from '../../../../config/app'

const fileSchema = Joi.object({
    fieldname: Joi.string().optional(),
    encoding: Joi.string().optional(),
    buffer: Joi.optional(),
    originalname: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(app.max_photo_size).required() // Maksimum ukuran file 2MB
})

const userSchema: ObjectSchema = Joi.object({
    category_id: Joi.string().required(),
    title: Joi.string().required(),
    slug: Joi.string().required(),
    desc: Joi.string().required(),
    summary: Joi.string().required(),
    content: Joi.string().required(),
    status: Joi.string().required(),
    featured: Joi.number().required(),
})

const NewsCreateValidator = (req: Request, res: Response, next: NextFunction): void => {
    const files: { [fieldname: string]: Express.Multer.File[] } = req.files as { [fieldname: string]: Express.Multer.File[] }
    let fileArray: Express.Multer.File[] = []
    if (files !== undefined && files !== null) {
        fileArray = Object.values(files).flat()
    }
    let errorTotal: any[] = []

    if (typeof files == 'undefined') {
        delete req.body.picture
    }

    const { error } = userSchema.validate(req.body, { abortEarly: false })
    if (error) {
        const errors = error.details.map(detail => ({
            path: detail.context?.key,
            msg: detail.message,
        }))
        errorTotal = errors
    }

    if (typeof files != 'undefined') {
        if (fileArray.length > 0) {
            fileArray.map(file => {
                const errorImage  = fileSchema.validate(file, { abortEarly: false }).error
                if (errorImage) {
                    const errorsImage = errorImage.details.map(detail => ({
                        path: file.fieldname,
                        msg: detail.message,
                    }))
                    errorTotal = errorTotal.concat(errorsImage)
                }
            })
        }
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

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('File harus berupa gambar'))
        }
    }
})

export { NewsCreateValidator, upload }
