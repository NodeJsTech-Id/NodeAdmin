import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { HomepageMenu } from '../../../models/homepage_menu.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'

export default class HomepageMenuService {
	private homepageMenuRepository = AppDataSource.getRepository(HomepageMenu)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.homepageMenuRepository.createQueryBuilder('homepage_menus')
						.innerJoinAndSelect('homepage_menus.childs','childs')

		// filter
		if (cleanConditions.position) {
			query = query.andWhere(`homepage_menus.position = :position`, { position: `${cleanConditions.position}` })
		}
		if (cleanConditions.name) {
			query = query.andWhere(`homepage_menus.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.url) {
			query = query.andWhere(`homepage_menus.url LIKE :url`, { url: `%${cleanConditions.url}%` })
		}
		if (cleanConditions.target) {
			query = query.andWhere(`homepage_menus.target = :target`, { target: `${cleanConditions.target}` })
		}
		if (cleanConditions.status) {
			query = query.andWhere(`homepage_menus.status = :status`, { status: `${cleanConditions.status}` })
		}

		query = query.addOrderBy('homepage_menus.level','ASC')

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

	public async create() {
		const menus = await this.homepageMenuRepository.find()
		return { menus }
	}

	public async store(request: any) {
		try {
			const find = await this.homepageMenuRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Homepage Menu Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.homepageMenuRepository.create({ ...request })
			const result = await this.homepageMenuRepository.save(data)
			if (!result) {
				throw new Error("Store Homepage Menu Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.homepageMenuRepository.findOne({ where: { id } })
		const menus = await this.homepageMenuRepository.find()
		return { data, menus }
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.homepageMenuRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Homepage Menu Already Exists")
			}
			const homepageMenu = await this.homepageMenuRepository.findOne({ where: { id } })
			if (!homepageMenu) {
				throw new Error('Homepage Menu not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.homepageMenuRepository.merge(homepageMenu, { ...request })
			const result = await this.homepageMenuRepository.save(data)
			if (!result) {
				throw new Error("Update Homepage Menu Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.homepageMenuRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.homepageMenuRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}