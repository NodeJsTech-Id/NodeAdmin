import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import multer, { FileFilterCallback } from 'multer';
import app from '../../../../config/app';

const fileSchema = Joi.object({
    fieldname: Joi.string().optional(),
    encoding: Joi.string().optional(),
    buffer: Joi.optional(),
    originalname: Joi.string().required(),
    mimetype: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(app.max_photo_size).required() // Maksimum ukuran file 2MB
});

const SettingServiceSchema: ObjectSchema = Joi.object({
    initial: Joi.string().allow('').optional(),
    name: Joi.string().allow('').optional(),
    description: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    address: Joi.string().allow('').optional(),
    email: Joi.string().allow('').optional(),
    copyright: Joi.string().allow('').optional(),
});

const SettingValidator = (req: Request, res: Response, next: NextFunction): void => {
    const files: { [fieldname: string]: Express.Multer.File[] } = req.files as { [fieldname: string]: Express.Multer.File[] };
    const fileArray: Express.Multer.File[] = Object.values(files).flat();

    let errorTotal: any[] = []

    if (typeof files == 'undefined') {
        delete req.body.picture
    }

    const { error } = SettingServiceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map(detail => ({
            path: detail.context?.key,
            msg: detail.message,
        }));
        errorTotal = errors
    }

    if (typeof files != 'undefined') {
        if (fileArray.length > 0) {
            fileArray.map(file => {
                const errorImage  = fileSchema.validate(file, { abortEarly: false }).error;
                if (errorImage) {
                    const errorsImage = errorImage.details.map(detail => ({
                        path: file.fieldname,
                        msg: detail.message,
                    }));
                    errorTotal = errorTotal.concat(errorsImage)
                }
            })
        }
    }

    if (errorTotal.length > 0) {
        req.session.errors = errorTotal
        req.session.old = req.body
        return res.redirect('back')
    }

    next();
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('File harus berupa gambar'));
        }
    }
});

export { upload, SettingValidator };
