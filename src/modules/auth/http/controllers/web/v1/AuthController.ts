import path from 'path'
import Module from '../../../../Module'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import UserService from '../../../../../access/http/services/v1/UserService'
import AppDataSource from '../../../../../../config/ormconfig'
import { User } from '../../../../../access/models/user.entity'
import { app } from '../../../../../..'
import { sendMail } from '../../../../../../services/mailer'
import bcrypt from 'bcryptjs'
import appConfig from '../../../../../../config/app'

const generateOTP = (length: number = 6): string => {
	let otp = ''
	const characters = '0123456789'
	for (let i = 0; i < length; i++) {
	  otp += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return otp
}

export default class AuthController {
	private userService = new UserService
    private userRepository = AppDataSource.getRepository(User)

	public async getLogin(req: Request, res: Response) {
		if (req.isAuthenticated()) {
            res.redirect('/admin/v1/dashboard')
        }
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/login'), {
            layout: './layouts'+appConfig.be_layout+'/full-width'
        })
    }

	public async getRegister(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/register'), {
            layout: './layouts'+appConfig.be_layout+'/full-width'
        })
    }

	public async postRegister(req: Request, res: Response) {
		try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                req.session.errors = errors.array()
                return res.redirect('/auth/register')
            }
            const result = await this.userService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Register Success. Please Login.' }
            res.redirect('/auth/login')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/auth/register')
        }
	}

	public logout(req: Request, res: Response) {
		req.logout(() => {
			res.redirect('/auth/login')
		})
	}

    public request_view(req: Request, res: Response) {
		res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/reset_req'), {
            layout: './layouts'+appConfig.be_layout+'/full-width'
        })
	}

    public async request(req: Request, res: Response) {
		try {
			const { email } = req.body
			const user = await this.userRepository.findOne({ where: { email } })
			if (!user) {
                throw new Error('Invalid email')
			}
			const otp = generateOTP()
			const data = this.userRepository.merge(user, { password_otp:otp })
			await this.userRepository.save(data)

			const html = await new Promise<string>((resolve, reject) => {
				app.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/mail/otp'), {
					otp,
					layout: './mails/main'
				}, (err, html) => {
					if (err) reject(err);
					else resolve(html);
				})
			})
            await sendMail(user.email, 'Request Reset Password', `Your OTP is ${otp}`, html)
			req.session.flashMessage = { key: 'success', message: 'OTP Send Success.' }
            res.redirect('/admin/v1/auth/reset/proc')
		} catch (err: any) {
			req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/auth/login')
		}
	}

    public process_view(req: Request, res: Response) {
		res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/reset_proc'), {
            layout: './layouts'+appConfig.be_layout+'/full-width'
        })
	}

	public async process(req: Request, res: Response) {
		try {
			const { email, otp, password } = req.body
			const user = await this.userRepository.findOne({ where: { email, password_otp: otp } })
			if (!user) {
                throw new Error('Invalid email & OTP')
			}
			const data = this.userRepository.merge(user, { password_otp:'', password: await bcrypt.hash(password, 10) })
			await this.userRepository.save(data)
			req.session.flashMessage = { key: 'success', message: 'Reset Password Success.' }
            res.redirect('/auth/login')
		} catch (err: any) {
			req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/auth/reset/proc')
		}
	}
}