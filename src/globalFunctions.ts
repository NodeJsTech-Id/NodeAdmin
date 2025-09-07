import { Request, Response, NextFunction } from 'express'
import fileService from './services/fileService'
import { User } from './modules/access/models/user.entity'
import { Setting } from './modules/setting/models/setting.entity'
import AppDataSource from './config/ormconfig'

export const globalFunctions = async (req: Request, res: Response, next: NextFunction) => {
	res.locals.getError = (key: string) => {
		if (!res.locals.errors) {
			return false
		}
		return res.locals.errors.find((error: { path: string }) => error.path === key)
	}

	res.locals.getFlashMessage = (key: string) => {
		if (!res.locals.flashMessage) {
			return false
		} else {
			if (res.locals.flashMessage.key == key) {
				return res.locals.flashMessage
			} else {
				return false
			}
		}
	}

	res.locals.getOld = (key: string) => {
		if (res.locals.old) {
			return res.locals.old[key]
		}
	}

	res.locals.fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
	res.locals.queryParams = req.query

	res.locals.auth = req.user as User

	const setting = await AppDataSource.getRepository(Setting).find()
	res.locals.setting = setting[0]

	res.locals.addOrUpdateQueryParam = (fullUrl: string | URL, key: string, value: string) => {
		const parsedUrl = new URL(fullUrl)
		parsedUrl.searchParams.set(key, value)
		return parsedUrl.toString()
	}

	res.locals.getFile = (fileName: string) => {
		return fileService.getFile(fileName)
	}

	res.locals.hasAccess = (name: string, method: string) => {
		const user = req.user as User
		const admin = user?.roles.some((role: { name: string }) =>
			role.name === 'Administrator'
		)
		if (admin) return true
		const found = user?.roles.some((role: { permissions: { name: string, method: string }[] }) =>
            role.permissions.some((permission: { name: string, method: string }) =>
                permission.name === name && permission.method === method
            )
        )
		return (typeof found == undefined) ? false:found
	}

	res.locals.hasRole = (roleName: string) => {
		const user = req.user as User
    const found = user?.roles.some((role: { name: string }) =>
            role.name === roleName
        )
		return (typeof found == undefined) ? false:found
	}

	next()
}
