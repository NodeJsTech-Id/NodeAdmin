/**
 * Hierarki error aplikasi. Service melempar error ini (bukan `return error`),
 * lalu errorHandler middleware menerjemahkannya ke response yang tepat.
 */
export class AppError extends Error {
    public readonly statusCode: number
    public readonly details?: unknown
    public readonly isOperational = true

    constructor(message: string, statusCode = 500, details?: unknown) {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.details = details
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details?: unknown) {
        super(message, 404, details)
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation error', details?: unknown) {
        super(message, 422, details)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details?: unknown) {
        super(message, 401, details)
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict', details?: unknown) {
        super(message, 409, details)
    }
}
