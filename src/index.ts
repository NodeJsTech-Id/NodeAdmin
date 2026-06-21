import 'dotenv/config'
// Force application-level timezone to UTC
process.env.TZ = 'UTC'
import 'reflect-metadata'
import express from 'express'
import path from 'path'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import bcrypt from 'bcryptjs'
import { createApp, ResponseHandler } from '@flazhost-nodeadmin/core'
import { globalFunctions } from './globalFunctions'
import { User } from './modules/access/models/user.entity'
import AppDataSource from './config/ormconfig'
import { clientRedis, RedisStore, cntRedis } from './services/redisClient'
import env from './config/env'
import appConfig from './config/app'
import './container' // registrasi DI (repository factories + services)

const PORT = env.app.port
const isTest = env.nodeEnv === 'test'

// redis: middleware penjamin koneksi (no-op di test — pakai MemoryStore)
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

// Registrasi strategi passport pada singleton yang sama dipakai core middleware
const userRepository = AppDataSource.getRepository(User)
const configurePassport = (p: typeof passport) => {
    p.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await userRepository.findOne({ where: { email } })
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' })
        }
        return done(null, user)
    }))

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

    p.serializeUser((user: any, done) => {
        done(null, user.id)
    })

    p.deserializeUser(async (id: string, done) => {
        try {
            const user = await userRepository.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] })
            done(null, user)
        } catch (err) {
            done(err, null)
        }
    })
}

const app = createApp({
    isProd: env.isProd,
    isTest,
    cors: { origin: `${env.app.host}:${PORT}` },
    static: { dir: 'public', maxAge: env.isProd ? '7d' : 0 },
    session: { secret: env.session.secret, ttlMs: env.session.ttlMs },
    sessionStore: isTest ? undefined : new RedisStore({ client: clientRedis as any, ttl: env.session.ttlMs }),
    ensureRedisConnected,
    globalLocals: globalFunctions,
    configurePassport,
    // Root '/' didaftar di module home (routes/web.ts) agar terkena layout.
    views: {
        engine: 'ejs',
        dir: path.resolve(__dirname, 'resources'),
        layoutPath: path.resolve(__dirname, 'resources/layouts/main'),
        viewSegment: appConfig.be_view,
        layoutSegment: appConfig.be_layout,
    },
    modulesDir: path.join(__dirname, 'modules'),
})

// Ekspor aplikasi dan inisialisasi AppDataSource
const initializeApp = async () => {
    try {
        await AppDataSource.initialize()
        console.log('Data Source has been initialized!')
        // UTC dijamin lewat process.env.TZ='UTC' (proses) + opsi driver per-dialek
        // di ormconfig (timezone:'Z' untuk mysql/mariadb). Tidak perlu raw SQL
        // spesifik-vendor di sini agar tetap dialect-agnostic.
        app.listen(PORT, () => {
            console.log(`Server is running on ${env.app.host}:${PORT}`)
        })
    } catch (error) {
        console.error('Error during Data Source initialization:', error)
    }
}

// Graceful shutdown — tutup koneksi Redis & DataSource agar tidak menggantung
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

// Bootstrap server HANYA saat dijalankan langsung (node dist/index.js / ts-node).
// Saat di-import (mis. oleh supertest), app diekspor tanpa listen/connect.
if (require.main === module) {
    cntRedis().then(() => {
        initializeApp()
    }).catch(console.error)
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
}

export { app, AppDataSource, clientRedis }
