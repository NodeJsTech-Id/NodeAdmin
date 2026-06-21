import 'dotenv/config'
// Force application-level timezone to UTC
process.env.TZ = 'UTC'
import 'reflect-metadata'
import express from 'express'
import path from 'path'
import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { createApp, ResponseHandler } from '@flazhost-nodeadmin/core'
import { User } from './modules/access/models/user.entity'
import AppDataSource from './config/ormconfig'
import { clientRedis, cntRedis } from './services/redisClient'
import env from './config/env'
import './container' // registrasi DI (repository factories + services)

const PORT = env.app.port
const isTest = env.nodeEnv === 'test'

// redis: middleware penjamin koneksi (dipakai untuk blacklist token JWT)
const ensureRedisConnected = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (isTest) return next()
    if (!clientRedis.isOpen) {
        try {
            await clientRedis.connect()
        } catch (err) {
            console.error('Could not reconnect to Redis:', err)
            return ResponseHandler.error(res, 'Internal server error', null, 500)
        }
    }
    next()
}

// Mode api: hanya strategi JWT (tanpa LocalStrategy/session/serialize web).
const userRepository = AppDataSource.getRepository(User)
const configurePassport = (p: typeof passport) => {
    p.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.jwt.secret,
        algorithms: [env.jwt.algorithm],
    }, async (jwtPayload, done) => {
        const user = await userRepository.findOne({ where: { id: jwtPayload.id } })
        if (!user) {
            return done(null, false)
        }
        return done(null, user)
    }))
}

const app = createApp({
    mode: 'api',
    isProd: env.isProd,
    isTest,
    cors: { origin: `${env.app.host}:${PORT}` },
    ensureRedisConnected,
    configurePassport,
    // View engine minimal: dipakai render email reset-password (resources/mails).
    views: {
        engine: 'ejs',
        dir: path.resolve(__dirname, 'resources'),
    },
    modulesDir: path.join(__dirname, 'modules'),
})

// Inisialisasi AppDataSource + listen
const initializeApp = async () => {
    try {
        await AppDataSource.initialize()
        console.log('Data Source has been initialized!')
        const server = app.listen(PORT, () => {
            console.log(`API server is running on ${env.app.host}:${PORT}`)
        })
        // Tangani error listen (mis. EADDRINUSE) — tanpa handler, event 'error'
        // tak tertangkap try/catch (asinkron) → proses mati mendadak.
        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} sudah dipakai proses lain. ` +
                    `Hentikan instance lama atau ubah PORT di .env.`)
            } else {
                console.error('Server gagal dijalankan:', err)
            }
            process.exit(1)
        })
    } catch (error) {
        console.error('Error during Data Source initialization:', error)
        process.exit(1)
    }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`\n${signal} diterima, menutup koneksi...`)
    try {
        if (clientRedis.isOpen) await clientRedis.quit()
        if (AppDataSource.isInitialized) await AppDataSource.destroy()
    } catch (e) {
        console.error('Error saat shutdown:', e)
    } finally {
        process.exit(0)
    }
}

if (require.main === module) {
    cntRedis().then(() => {
        initializeApp()
    }).catch(console.error)
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
}

export { app, AppDataSource, clientRedis }
