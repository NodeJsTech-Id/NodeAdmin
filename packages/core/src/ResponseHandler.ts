import { convertDatesDeep } from './utils/date'

class ResponseHandler {
    static success(res: any, message: string, data: any = null, statusCode: number = 200) {
        const tz = res?.locals?.userTimezone || 'UTC'
        const payload = convertDatesDeep(data, tz)
        return res.status(statusCode).json({
            status: true,
            message,
            data: payload,
        });
    }

    static error(res: any, message: string, data: any = null, statusCode: number = 500) {
        return res.status(statusCode).json({
            status: false,
            message,
            data,
        });
    }

    static notFound(res: any, message: string = 'Resource not found') {
        return res.status(404).json({
            status: false,
            message,
            data: null,
        });
    }

    static validationError(res: any, errors: any, statusCode: number = 422) {
        return res.status(statusCode).json({
            status: false,
            message: 'Validation Error',
            errors,
        });
    }
}

export default ResponseHandler;
