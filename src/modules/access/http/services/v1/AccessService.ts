import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Access } from '../../../models/access.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { Application } from 'express'

export default class AccessService {
	private accessRepository = AppDataSource.getRepository(Access)

	public async getAllRegisteredRoute(app: Application) {
        const routes: { method: string, path: string }[] = []
		const extractRoutes = (stack: any) => {
			stack.forEach((middleware: any) => {
				if (middleware.route) {
					const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase())
					const path = middleware.route.path
					methods.forEach(method => routes.push({ method, path }))
				} else if (middleware.name === 'router' || middleware.handle && middleware.handle.stack) {
					extractRoutes(middleware.handle.stack)
				}
			})
		}
		extractRoutes(app._router.stack)
		for (const route of routes) {
			let access = await this.accessRepository.findOne({ where: { url: route.path, method: route.method } })
			if (!access) {
				access = this.accessRepository.create({
					url: route.path,
					method: route.method
				})
				await this.accessRepository.save(access)
			}
		}
    }

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.accessRepository.createQueryBuilder('accesses')

		// filter
		if (cleanConditions.url) {
			query = query.andWhere(`accesses.url LIKE :url`, { url: `%${cleanConditions.url}%` })
		}
		if (cleanConditions.method) {
			query = query.andWhere(`accesses.method = :method`, { method: cleanConditions.method })
		}
		if (cleanConditions.status) {
			query = query.andWhere(`accesses.status = :status`, { status: cleanConditions.status })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`accesses.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { datas:datas[0], paginate_data }
	}

	public async store(request: any) {
		try {
			const find = await this.accessRepository.findOne({ where: { url: request.url } })
			if (find) {
				throw new Error("Access Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.accessRepository.create({ ...request })
			const result = await this.accessRepository.save(data)
			if (!result) {
				throw new Error("Store Access Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.accessRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.accessRepository.findOne({ where: { id: Not(id), url: request.url } })
			if (find) {
				throw new Error("Access Already Exists")
			}
			const access = await this.accessRepository.findOne({ where: { id } })
			if (!access) {
				throw new Error('Access not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.accessRepository.merge(access, { ...request })
			const result = await this.accessRepository.save(data)
			if (!result) {
				throw new Error("Update Access Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.accessRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.accessRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}