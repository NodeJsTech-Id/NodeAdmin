import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { app, AppDataSource, clientRedis } from '../../../../../../index'
import { User } from '../../../../../access/models/user.entity'
import { JwtPayload } from '../../../../../../types/JwtPayload'
import ResponseHandler from '../../../../../../ResponseHandler'
import path from 'path'
import Module from '../../../../Module'
import { sendMail } from '../../../../../../services/mailer'

const generateOTP = (length: number = 6): string => {
	let otp = ''
	const characters = '0123456789'
	for (let i = 0; i < length; i++) {
	  otp += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return otp
}

export default class AuthController {
	private userRepository = AppDataSource.getRepository(User)

	public async login(req: Request, res: Response) {
		const { email, password } = req.body
		const user = await this.userRepository.findOne({ where: { email } })
		if (!user) {
			return ResponseHandler.error(res, "Invalid email or password", null, 401)
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return ResponseHandler.error(res, "Invalid email or password", null, 401)
		}

		const token = jwt.sign({ id: user.id, email: user.email } as JwtPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })
		return ResponseHandler.success(res, "Ok", {
			access_token: token,
			token_type: "Bearer",
			expires_in: 3600,
		})
	}

	public async register(req: Request, res: Response) {
        const { name, email, password } = req.body
		const existingUser = await this.userRepository.findOne({ where: { email } })
		if (existingUser) {
			return res.status(400).json({ message: 'Email already in use' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const user = new User()
		user.name = name
		user.email = email
		user.password = hashedPassword

		await this.userRepository.save(user)
		return ResponseHandler.success(res, "User registered successfully")
    }

	public async logout(req: Request, res: Response) {
		const token = req.headers.authorization?.split(' ')[1]
		if (!token) {
			return ResponseHandler.error(res, "No token provided", null, 400)
		}
		await clientRedis.set(token, 'blacklisted')
		return ResponseHandler.success(res, "Success")
	}

	public async request(req: Request, res: Response) {
		try {
			const { email } = req.body
			const user = await this.userRepository.findOne({ where: { email } })
			if (!user) {
				return ResponseHandler.error(res, "Invalid email", null, 401)
			}
			const otp = generateOTP()
			const data = this.userRepository.merge(user, { password_otp:otp })
			await this.userRepository.save(data)

			const html = await new Promise<string>((resolve, reject) => {
				app.render(path.resolve(Module.path, 'views/mail/otp'), {
					otp,
					layout: './mails/main'
				}, (err, html) => {
					if (err) reject(err);
					else resolve(html);
				})
			})
			await sendMail(user.email, 'Request Reset Password', `Your OTP is ${otp}`, html)
			return ResponseHandler.success(res, "Success")
		} catch (error: any) {
			return ResponseHandler.error(res, error.message)
		}
	}

	public async process(req: Request, res: Response) {
		try {
			const { email, otp, password } = req.body
			const user = await this.userRepository.findOne({ where: { email, password_otp: otp } })
			if (!user) {
				return ResponseHandler.error(res, "Invalid email & OTP", null, 401)
			}
			const data = this.userRepository.merge(user, { password_otp:'', password: await bcrypt.hash(password, 10) })
			await this.userRepository.save(data)
			return ResponseHandler.success(res, "Success")
		} catch (error: any) {
			return ResponseHandler.error(res, error.message)
		}
	}
}