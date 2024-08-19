import 'dotenv/config'
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
// import https from 'https'

const https = require('https')
const app = express()
// const PORT = process.env.APP_PORT
const PORT = 443

// https config
// Load certificates and private keys for each domain
const certificates = {
    'kelascendikia.id': {
        key: process.env.KELASCENDIKIA_SSL_ID_KEY,
        cert: process.env.KELASCENDIKIA_SSL_ID_CERT
    },
    'kelascendikia.com': {
        key: process.env.KELASCENDIKIA_SSL_COM_KEY,
        cert: process.env.KELASCENDIKIA_SSL_COM_CERT
    }
}
const server = https.createServer({
    SNICallback: (hostname: string | number, callback: (arg0: null, arg1: any) => void) => {
        if (certificates[hostname as keyof typeof certificates]) {
            callback(null, https.createSecureContext(certificates[hostname as keyof typeof certificates]));
        } else {
            callback(null, https.createSecureContext({
                key: fs.readFileSync('path/to/default-private.key'),
                cert: fs.readFileSync('path/to/default-certificate.crt')
            }));
        }
    }
}, app)

// config CORS
const corsOptions = {
    origin: `http://localhost:${PORT}/`,
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}

app.use(cors(corsOptions))

// redis
const clientRedis = createClient({
    url: process.env.KELASCENDIKIA_REDIS_URL,
    database: 0
})

clientRedis.on('error', (err) => {
    console.error('Redis error:', err)
})

const connectRedis = async () => {
    try {
        await clientRedis.connect()
        console.log('Connected to Redis')
    } catch (err) {
        console.error('Could not connect to Redis:', err)
    }
}

const ensureRedisConnected = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!clientRedis.isOpen) {
        try {
            await clientRedis.connect()
        } catch (err) {
            console.error('Could not reconnect to Redis:', err)
            return ResponseHandler.error(res, "Internal server error", null, 500)
        }
    }
    next()
}

// express config
app.use(ensureRedisConnected)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(express.static('public'))

// Configure session and passport
app.use(session({ secret: process.env.KELASCENDIKIA_SESSION_SECRET || 'secret', resave: false, saveUninitialized: false }))
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
    next()
})
app.use(globalFunctions)

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
    secretOrKey: process.env.KELASCENDIKIA_JWT_SECRET || 'secret'
}, async (jwtPayload, done) => {
    console.log(jwtPayload)
    console.log(jwtPayload.id)
    const user = await userRepository.findOne(jwtPayload.id)
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
        const user = await userRepository.findOne({ where: { id }, relations: ['roles', 'roles.accesses'] })
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})

// Redirect root to /admin/users if authenticated, otherwise to /auth/login
// app.get('/', (req, res) => {
//     if (req.isAuthenticated()) {
//         res.redirect('/admin/v1/dashboard')
//     } else {
//         res.redirect('/auth/login')
//     }
// })

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

// Ekspor aplikasi dan inisialisasi AppDataSource
const initializeApp = async () => {
    try {
        await AppDataSource.initialize()
        console.log('Data Source has been initialized!')
        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('Error during Data Source initialization:', error)
    }
}

connectRedis().then(() => {
    initializeApp()
}).catch(console.error)

export { app, AppDataSource, clientRedis }
