import * as dotenv from 'dotenv'
dotenv.config()

/**
 * Konfigurasi environment terpusat & tervalidasi.
 * - Secret wajib (SESSION_SECRET, JWT_SECRET) → fail-fast bila kosong di production,
 *   sehingga aplikasi tidak pernah jalan dengan secret default yang bisa ditebak.
 * - Tipe sudah dikonversi (number/boolean), tidak lagi string mentah.
 */

const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = NODE_ENV === 'production'

function required(name: string, fallbackDev?: string): string {
    const val = process.env[name]
    if (val && val.trim() !== '') return val
    if (isProd) {
        throw new Error(`[env] ${name} wajib di-set di production`)
    }
    // Di non-production boleh pakai fallback dev agar mudah dijalankan lokal,
    // tetapi tetap beri peringatan.
    console.warn(`[env] ${name} tidak di-set — memakai nilai dev sementara`)
    return fallbackDev ?? `dev-${name.toLowerCase()}`
}

function num(name: string, def: number): number {
    const v = process.env[name]
    const n = v ? parseInt(v, 10) : NaN
    return Number.isFinite(n) ? n : def
}

function bool(name: string, def = false): boolean {
    const v = process.env[name]
    if (v === undefined) return def
    return v === 'true' || v === '1'
}

export const env = {
    nodeEnv: NODE_ENV,
    isProd,

    app: {
        host: process.env.APP_HOST || 'http://localhost',
        port: num('APP_PORT', 3000),
        name: process.env.APP_NAME || 'Node Admin',
    },

    db: {
        type: (process.env.DB_TYPE || 'mysql'),
        host: process.env.DB_HOST,
        port: num('DB_PORT', 3306),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        synchronize: bool('DB_SYNCHRONIZE', false),
        logging: bool('DB_LOGGING', false),
        connectionLimit: num('DB_CONNECTION_LIMIT', 10),
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    },

    session: {
        secret: required('SESSION_SECRET'),
        ttlMs: num('SESSION_TTL_HOURS', 6) * 60 * 60 * 1000,
    },

    jwt: {
        secret: required('JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        algorithm: 'HS256' as const,
    },

    security: {
        bcryptRounds: num('BCRYPT_ROUNDS', 10),
        otpExpiryMs: num('OTP_EXPIRY_MINUTES', 10) * 60 * 1000,
    },

    mail: {
        host: process.env.MAIL_HOST,
        port: num('MAIL_PORT', 587),
        secure: bool('MAIL_SECURE', false),
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        fromName: process.env.MAIL_FROM_NAME || 'Node Admin',
        fromAddress: process.env.MAIL_FROM_ADDRESS || 'no-reply@example.com',
    },

    oss: {
        accessId: process.env.OSS_ACCESS_ID as string,
        accessKey: process.env.OSS_ACCESS_KEY as string,
        endpoint: process.env.OSS_ENDPOINT,
        bucket: process.env.OSS_BUCKET,
        secure: bool('OSS_SSL', true),
    },

    pagination: {
        defaultPageSize: num('DEFAULT_PAGE_SIZE', 10),
    },

    roles: {
        administrator: 'Administrator',
    },
}

export default env
