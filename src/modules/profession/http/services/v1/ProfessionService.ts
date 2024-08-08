import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Profession } from '../../../models/profession.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'

export default class ProfessionService {
	private professionRepository = AppDataSource.getRepository(Profession)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.professionRepository.createQueryBuilder('categories')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`categories.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.status) {
			query = query.andWhere(`categories.status = :status`, { status: `%${cleanConditions.status}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`categories.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
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
			const find = await this.professionRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Profession Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.professionRepository.create({ ...request })
			const result = await this.professionRepository.save(data)
			if (!result) {
				throw new Error("Store Profession Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.professionRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.professionRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Profession Already Exists")
			}
			const profession = await this.professionRepository.findOne({ where: { id } })
			if (!profession) {
				throw new Error('Profession not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.professionRepository.merge(profession, { ...request })
			const result = await this.professionRepository.save(data)
			if (!result) {
				throw new Error("Update Profession Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.professionRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.professionRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}