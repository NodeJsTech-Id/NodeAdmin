import { In, Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { Subject } from '../../../models/subject.entity'
import { SubjectSub } from '../../../models/subject_sub.entity'
import { SubjectSubDetail } from '../../../models/subject_sub_detail.entity'
import { Category } from '../../../../category/models/category.entity'

export default class SubjectService {
	private subjectRepository = AppDataSource.getRepository(Subject)
	private categoryRepository = AppDataSource.getRepository(Category)
	private subjectSubRepository = AppDataSource.getRepository(SubjectSub)
	private subjectSubDetailRepository = AppDataSource.getRepository(SubjectSubDetail)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectRepository.createQueryBuilder('subjects')

		query = query.leftJoinAndSelect('subjects.categories','categories')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subjects.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`subjects.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
		if (cleanConditions.category_id) {
			query = query.where((qb) => {
				const subQuery = qb.subQuery()
					.select('subject_id')
					.from('subjects_categories', 'sc')
					.where('sc.category_id = :category_id')
					.getQuery();
				return 'subjects.id IN ' + subQuery;
			})
			.setParameter('category_id', cleanConditions.category_id)
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
		const categories = await this.categoryRepository.find()
		return { datas:datas[0], paginate_data, categories }
	}

	public async create() {
		const categories = await this.categoryRepository.find()
		return categories
	}

	public async store(request: any) {
		try {
			const find = await this.subjectRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Subject Already Exists")
			}
			const categories = await this.categoryRepository.findBy({ id: In(request.categories) })
			if (!categories.length) {
				throw new Error("Categories Not Found")
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectRepository.create({ ...request, categories })
			const result = await this.subjectRepository.save(data)
			if (!result) {
				throw new Error("Store Subject Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async edit(id: string) {
		const data = await this.subjectRepository.findOne({ where: { id }, relations: ['categories'] })
		const categories = await this.categoryRepository.find()
		return { data, categories }
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.subjectRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Subject Already Exists")
			}
			const subject = await this.subjectRepository.findOne({ where: { id } })
			if (!subject) {
				throw new Error('Subject not found')
			}
			let categories
			if (Array.isArray(request.categories) && request.categories.length) {
				categories = await this.categoryRepository.findBy({ id: In(request.categories) })
				if (!categories.length) {
					throw new Error("categories Not Found")
				}
			} else {
				categories = subject.categories
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectRepository.merge(subject, { ...request, categories })
			const result = await this.subjectRepository.save(data)
			if (!result) {
				throw new Error("Update Subject Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete(id: string) {
		const data = await this.subjectRepository.findOne({ where: { id }, relations: ["subject_subs", "subject_subs.subject_sub_details"] })
		if (!data) {
			return false
		}
		const resultSubs = await this.subjectSubRepository.remove(data.subject_subs)
		if (!resultSubs) {
			return false
		}
		data.subject_subs.forEach(async (subject_sub) => {
			const resultSubDetails = await this.subjectSubDetailRepository.remove(subject_sub.subject_sub_details)
			if (!resultSubDetails) {
				return false
			}
		})
		const result = await this.subjectRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}