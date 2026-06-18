import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express'
import path from 'path'
import fs from 'fs'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import expressLayouts from 'express-ejs-layouts'
import flash from 'connect-flash'
import passport from 'passport'
import namedRoutes from './utils/namedRoutes'
import { csrfProtection } from './middleware/csrf'
import { errorHandler } from './middleware/errorHandler'
import { convertDatesDeep } from './utils/date'
import { configureViewPaths } from './utils/view'

/**
 * Opsi createApp — bagian generik dirakit core; bagian app-spesifik (passport
 * strategies, redis, root-redirect, global locals, daftar modul) disuntik app.
 */
export interface CreateAppOptions {
    isProd: boolean
    isTest: boolean
    cors: { origin: string }
    static: { dir: string; maxAge: string | number }
    session: { secret: string; ttlMs: number }
    /** Store session non-test (mis. RedisStore). Test → MemoryStore default. */
    sessionStore?: session.Store
    /** Middleware koneksi redis (no-op di test). */
    ensureRedisConnected?: RequestHandler
    /** Middleware app yang mengisi res.locals global (globalFunctions). */
    globalLocals: RequestHandler
    /** Registrasi strategi passport pada singleton yang sama dipakai core. */
    configurePassport: (p: typeof passport) => void
    /** Handler route root '/' (redirect app-spesifik via named routes). */
    rootHandler: (req: Request, res: Response) => void
    views: {
        engine: string
        /** Direktori root view (app.set('views')). */
        dir: string
        /** Path layout default (app.set('layout')). */
        layoutPath: string
        /** Segmen view backend untuk renderView (mis. '/be/tw'). */
        viewSegment: string
        /** Segmen layout backend untuk renderView (mis. '/be/tw'). */
        layoutSegment: string
    }
    /** Direktori modul untuk auto-load routes (web/api). */
    modulesDir: string
}

/**
 * Rakit Express app generik NodeAdmin dengan urutan middleware yang persis sama
 * seperti entrypoint asli. App turunan cukup memanggil createApp(opts) lalu
 * meng-initialize DataSource + listen sendiri.
 */
export function createApp(opts: CreateAppOptions): Application {
    const app = express()

    // Named routes + helper route builder di app.locals
    namedRoutes.extendExpress(app)
    app.locals.route = (name: string, params?: Record<string, string | number>) =>
        (app as any).namedRoutes.build(name, params)

    // Security headers (helmet). CSP dilonggarkan untuk CDN aset + inline.
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }))

    // Kompresi gzip/brotli
    app.use(compression())

    // CORS
    app.use(cors({
        origin: opts.cors.origin,
        optionsSuccessStatus: 200,
        methods: 'GET,POST,PUT,DELETE',
        credentials: true,
    }))

    // Static assets paling awal (lewati session/redis/global mw)
    app.use(express.static(opts.static.dir, {
        maxAge: opts.static.maxAge,
        etag: true,
    }))

    // Redis connect guard (no-op di test)
    if (opts.ensureRedisConnected) {
        app.use(opts.ensureRedisConnected)
    }

    // Body parsers + method override + cookies
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(methodOverride('_method'))
    app.use(cookieParser())

    // Session — test memakai MemoryStore default (tanpa store)
    app.use(session({
        ...(opts.isTest || !opts.sessionStore ? {} : { store: opts.sessionStore }),
        secret: opts.session.secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: opts.isProd,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: opts.session.ttlMs,
        },
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    // connect-flash
    app.use(flash())

    // Pindahkan session errors/flash/old ke res.locals + route builder di view
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.errors = (req.session as any).errors
        delete (req.session as any).errors
        res.locals.flashMessage = (req.session as any).flashMessage
        delete (req.session as any).flashMessage
        res.locals.old = (req.session as any).old
        delete (req.session as any).old
        res.locals.successMessages = req.flash('success')
        res.locals.errorMessages = req.flash('error')
        res.locals.route = (name: string, params?: Record<string, string | number>) =>
            (req.app as any).namedRoutes.build(name, params)
        next()
    })

    // Global locals app-spesifik (auth, setting, theme, hasAccess, dll)
    app.use(opts.globalLocals)

    // Proteksi CSRF form web (API /api/ dilewati — stateless JWT)
    app.use(csrfProtection)

    // Konversi tanggal di view locals ke timezone user otomatis saat render
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

    // Registrasi strategi passport (Local/JWT/serialize) pada singleton yang sama
    opts.configurePassport(passport)

    // Root '/' — redirect app-spesifik
    app.get('/', opts.rootHandler)

    // View engine + layout
    app.use(expressLayouts)
    app.set('view engine', opts.views.engine)
    app.set('views', opts.views.dir)
    app.set('layout', opts.views.layoutPath)

    // Inject path view backend ke renderView
    configureViewPaths({ viewSegment: opts.views.viewSegment, layoutSegment: opts.views.layoutSegment })

    // Auto load semua route file di modules
    const loadRoutes = (modulePath: string) => {
        fs.readdirSync(modulePath, { withFileTypes: true }).forEach(file => {
            if (file.isDirectory() && file.name === 'routes') {
                loadRoutes(path.join(modulePath, file.name))
            } else if (file.isFile() && (file.name.match('web') || file.name.match('api'))) {
                const route = require(path.join(modulePath, file.name)).default
                app.use('/', route)
            }
        })
    }
    fs.readdirSync(opts.modulesDir).forEach(module => {
        loadRoutes(path.join(opts.modulesDir, module))
    })

    // Error handler terpusat — WAJIB terdaftar terakhir
    app.use(errorHandler)

    return app
}
