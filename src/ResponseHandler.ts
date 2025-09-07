import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)

class ResponseHandler {
    private static convertDates(value: any, timezone: string): any {
        if (!value) return value
        if (value instanceof Date) {
            // Represent in user's timezone with offset
            return dayjs.utc(value).tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ')
        }
        if (Array.isArray(value)) return value.map(v => this.convertDates(v, timezone))
        if (typeof value === 'object') {
            const out: any = Array.isArray(value) ? [] : {}
            for (const [k, v] of Object.entries(value)) out[k] = this.convertDates(v as any, timezone)
            return out
        }
        return value
    }

    static success(res: any, message: string, data: any = null, statusCode: number = 200) {
        const tz = res?.locals?.userTimezone || 'UTC'
        const payload = this.convertDates(data, tz)
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
