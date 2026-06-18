import rateLimit from 'express-rate-limit'

/**
 * Rate limiter untuk endpoint sensitif (login, register, reset OTP).
 * Membatasi brute-force per-IP.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10,                  // maks 10 percobaan / IP / window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later.' },
})

// Lebih ketat untuk verifikasi OTP (ruang 10^6, cegah brute-force)
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts, please try again later.' },
})
