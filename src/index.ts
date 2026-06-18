import 'dotenv/config'
// Force application-level timezone to UTC
process.env.TZ = 'UTC'
import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import express, {
    NextFunction,
    Request,
    Response
} from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import fs from 'fs'
import methodOverride from 'method-override'
import path from 'path'
import passport from 'passport'
import named from './utils/namedRoutes'
import { globalFunctions } from './globalFunctions'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { User } from './modules/access/models/user.entity'
import bcrypt from 'bcryptjs'
import flash from 'connect-flash'
import cors from 'cors'
import AppDataSource from './config/ormconfig'
import { createClient } from 'redis'
import ResponseHandler from './ResponseHandler'
import connectRedis from 'connect-redis'
import helmet from 'helmet'
import compression from 'compression'
import env from './config/env'
import './container' // registrasi DI (repository factories + services)

const app = express()
// enable named routes on app and expose helper
named.extendExpress(app)
app.locals.route = (name: string, params?: Record<string, string | number>) => (app as any).namedRoutes.build(name, params)
const PORT = env.app.port

// Security headers (helmet). CSP dilonggarkan untuk CDN aset (Tailwind/jQuery/dll)
// dan inline script/style yang masih dipakai view.
app.use(helmet({
    contentSecurityPolicy: false, // CDN + inline; aktifkan CSP granular bila aset sudah self-host
    crossOriginEmbedderPolicy: false,
}))

// Kompresi gzip/brotli untuk semua response
app.use(compression())

// config CORS — origin tanpa trailing slash agar match Origin header browser
const corsOptions = {
    origin: `${env.app.host}:${PORT}`,
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}

app.use(cors(corsOptions))

// redis
const RedisStore = connectRedis(session)
const clientRedis = createClient({
    url: env.redis.url,
    legacyMode: true,
})

clientRedis.on('error', (err) => {
    console.error('Redis error:', err)
})

const cntRedis = async () => {
    try {
        await clientRedis.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis:', err);
    }
}

const isTest = env.nodeEnv === 'test'

const ensureRedisConnected = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (isTest) return next() // test pakai MemoryStore, tak butuh Redis
    if (!clientRedis.isOpen) {
        try {
            await clientRedis.connect();
        } catch (err) {
            console.error('Could not reconnect to Redis:', err);
            return ResponseHandler.error(res, "Internal server error", null, 500);
        }
    }
    next();
}

// Static assets paling awal + cache header (lewati session/redis/global mw)
app.use(express.static('public', {
    maxAge: env.isProd ? '7d' : 0,
    etag: true,
}))

// express config
app.use(ensureRedisConnected)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(cookieParser())

// Configure session and passport.
// Test memakai MemoryStore default (tanpa Redis) agar suite terisolasi & cepat.
app.use(session({
    ...(isTest ? {} : { store: new RedisStore({ client: clientRedis as any, ttl: env.session.ttlMs }) }),
    secret: env.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env.isProd,        // HTTPS-only di production
        httpOnly: true,
        sameSite: 'lax',
        maxAge: env.session.ttlMs
    }
}))
app.use(passport.initialize())
app.use(passport.session())

// Initialize connect-flash
app.use(flash())

// set global functions
app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.errors = req.session.errors
    delete req.session.errors
    res.locals.flashMessage = req.session.flashMessage
    delete req.session.flashMessage
    res.locals.old = req.session.old
    delete req.session.old
    res.locals.successMessages = req.flash('success')
    res.locals.errorMessages = req.flash('error')
    // expose route builder to views
    res.locals.route = (name: string, params?: Record<string, string | number>) => (req.app as any).namedRoutes.build(name, params)
    next()
})
app.use(globalFunctions)

// Proteksi CSRF untuk form web (API /api/ dilewati — stateless JWT)
import { csrfProtection } from './middleware/csrf'
app.use(csrfProtection)

// Convert dates in view locals to user's timezone automatically on render
import { convertDatesDeep } from './utils/date'
app.use((req: Request, res: Response, next: NextFunction) => {
    const originalRender = res.render.bind(res)
    res.render = ((view: string, locals?: any, callback?: any) => {
        const tz = res.locals.userTimezone || 'UTC'
        if (locals && typeof locals === 'object') {
            locals = convertDatesDeep(locals, tz)
        }
        return originalRender(view, locals, callback)
    }) as any
    next()
})

// auth config
const userRepository = AppDataSource.getRepository(User)
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
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

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.jwt.secret,
    algorithms: [env.jwt.algorithm]
}, async (jwtPayload, done) => {
    const user = await userRepository.findOne({ where: { id: jwtPayload.id } })
    if (!user) {
        return done(null, false)
    }

    return done(null, user)
}))

passport.serializeUser((user: any, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await userRepository.findOne({ where: { id }, relations: ['roles', 'roles.permissions'] })
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

// Redirect root to /admin/users if authenticated, otherwise to /auth/login
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect((req.app as any).namedRoutes.build('admin.v1.dashboard.index'))
    } else {
        res.redirect((req.app as any).namedRoutes.build('web.auth.login'))
    }
})

// Set EJS as the view engine && set layout
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname,'resources'))
app.set('layout',path.resolve(__dirname,'resources/layouts/main'))

// Auto load all route file in modules
function loadRoutes(modulePath: string) {
    fs.readdirSync(modulePath, { withFileTypes: true }).forEach(file => {
        if (file.isDirectory() && file.name == 'routes') {
            loadRoutes(path.join(modulePath,file.name))
        } else if ( file.isFile() && (file.name.match('web') || file.name.match('api')) ) {
            const route = require(path.join(modulePath,file.name)).default
            app.use('/', route)
        }
    })
}
fs.readdirSync(path.join(__dirname,'modules')).forEach(module => {
    loadRoutes(path.join(__dirname,'modules',module))
})

// Error handler terpusat — WAJIB terdaftar terakhir (setelah semua route)
import { errorHandler } from './middleware/errorHandler'
app.use(errorHandler)

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
