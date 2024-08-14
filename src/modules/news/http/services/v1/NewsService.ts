import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { News } from '../../../models/news.entity'
import { NewsCategory } from '../../../models/news_category.entity'
import fileService from '../../../../../services/fileService'
import Module from '../../../Module'
import { v6 as uuidv6 } from 'uuid'

export default class NewsService {
	private newsRepository = AppDataSource.getRepository(News)
	private newsCategoryRepository = AppDataSource.getRepository(NewsCategory)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.newsRepository.createQueryBuilder('news')
			.leftJoinAndSelect('news.category','category')

		// filter
		if (cleanConditions.category_id) {
			query = query.andWhere(`news.category_id = :category_id`, { category_id: cleanConditions.category_id })
		}
		if (cleanConditions.title) {
			query = query.andWhere(`news.title LIKE :title`, { title: `%${cleanConditions.title}%` })
		}
		if (cleanConditions.status) {
			query = query.andWhere(`news.status = :status`, { status: cleanConditions.status })
		}
		if (cleanConditions.featured) {
			query = query.andWhere(`news.featured = :featured`, { featured: cleanConditions.featured })
		}
		if (cleanConditions.created_at_start && cleanConditions.created_at_end) {
			query = query.andWhere(`news.created_at BETWEEN :created_at_start AND :created_at_end`, {
				created_at_start: cleanConditions.created_at_start,
				created_at_end: cleanConditions.created_at_end,
			})
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
		const categories = await this.newsCategoryRepository.find()
		return { datas:datas[0], paginate_data, categories }
	}

	public async create() {
		const categories = await this.newsCategoryRepository.find()
		return { categories }
	}

	public async store(request: any, files: any = null,) {
		try {
			request.id = uuidv6()
			request.featured = request.featured == '1' ? true : false
			const find = await this.newsRepository.findOne({ where: { slug: request.slug } })
			if (find) {
				throw new Error("News Slug Already Exists")
			}
			if (files) {
				const fileName = request.id
				const uploadResults = await Promise.all(
					files.map((file: { originalname: any, buffer: any }) => {
						const path = Module.filePath+fileName+"."+file.originalname.split('.').pop().toLowerCase()
						fileService.uploadFile(path, file.buffer)
						request.image = path
					})
				)
			}
			request = functions.removeEmptyFields(request)
			const data = this.newsRepository.create({ ...request })
			const result = await this.newsRepository.save(data)
			if (!result) {
				throw new Error("Store News Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.newsRepository.findOne({ where: { id } })
		const categories = await this.newsCategoryRepository.find()
		return { data, categories }
	}

	public async update(id: string, request: any, files: any = null) {
		try {
			request.featured = request.featured == '1' ? true : false
			const find = await this.newsRepository.findOne({ where: { id: Not(id), slug: request.slug } })
			if (find) {
				throw new Error("News Slug Already Exists")
			}
			const category = await this.newsRepository.findOne({ where: { id } })
			if (!category) {
				throw new Error('News not found')
			}
			if (files) {
				const fileName = id
				const uploadResults = await Promise.all(
					files.map((file: { originalname: any, buffer: any }) => {
						const path = Module.filePath+fileName+"."+file.originalname.split('.').pop().toLowerCase()
						fileService.uploadFile(path, file.buffer)
						request.image = path
					})
				)
			}
			request = functions.removeEmptyFields(request)
			const data = this.newsRepository.merge(category, { ...request })
			const result = await this.newsRepository.save(data)
			if (!result) {
				throw new Error("Update News Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.newsRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.newsRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}

	public async show(slug: string) {
		try {
			const data = await this.newsRepository.findOne({ where: { slug }, relations: ["category"] })
			if (!data) throw new Error("News Not Found")
			const news = await this.newsRepository.find({ take: 3, order: { created_at: "DESC" }, where: {  id: Not(data.id), category_id: data.category_id } })
			const categories = await this.newsCategoryRepository.find()
			return { data, news, categories }
		} catch (error: any) {
			return error
		}
	}
}