import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Category } from '../../../models/category.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'

export default class CategoryService {
	private categoryRepository = AppDataSource.getRepository(Category)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.categoryRepository.createQueryBuilder('categories')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`categories.name LIKE :name`, { name: `%${cleanConditions.name}%` })
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
			const find = await this.categoryRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Category Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.categoryRepository.create({ ...request })
			const result = await this.categoryRepository.save(data)
			if (!result) {
				throw new Error("Store Category Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.categoryRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.categoryRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Category Already Exists")
			}
			const category = await this.categoryRepository.findOne({ where: { id } })
			if (!category) {
				throw new Error('Category not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.categoryRepository.merge(category, { ...request })
			const result = await this.categoryRepository.save(data)
			if (!result) {
				throw new Error("Update Category Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.categoryRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.categoryRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}