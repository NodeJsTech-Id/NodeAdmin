import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { SubjectSubContent } from '../../../models/subject_sub_content.entity'
import { SubjectSub } from '../../../models/subject_sub.entity'

export default class SubjectSubContentService {
	private subjectSubRepository = AppDataSource.getRepository(SubjectSub)
	private subjectSubContentRepository = AppDataSource.getRepository(SubjectSubContent)

	public async index(filter: any) {
		const subject_sub_id = filter.subject_sub_id
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectSubContentRepository.createQueryBuilder('subject_sub_contents')

		query = query.leftJoinAndSelect('subject_sub_contents.subject_sub','subject_subs')
		.leftJoinAndSelect('subject_subs.subject', 'subject')
		query = query.andWhere(`subject_sub_contents.subject_sub_id = :subject_sub_id`, { subject_sub_id })

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subject_sub_contents.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		query = query.addOrderBy("subject_sub_contents.order_number","ASC")

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const subject_sub = await this.subjectSubRepository.findOne({ where: { id: subject_sub_id }, relations: ["subject"] })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { datas:datas[0], paginate_data, subject_sub }
	}

	public async create(subject_sub_id: any) {
		const subject_sub = await this.subjectSubRepository.findOne({ where: { id: subject_sub_id }, relations: ["subject"] })
		return { subject_sub }
	}

	public async store(request: any) {
		try {
			const lastNumberData = await this.subjectSubContentRepository.findOne({ where: { subject_sub_id: request.subject_sub_id } })
			let lastNumber = 0
			if (lastNumberData) {
				lastNumber = lastNumberData.order_number+1
			}
			request.order_number = lastNumber
			const find = await this.subjectSubContentRepository.findOne({ where: { subject_sub_id: request.subject_sub_id, name: request.name } })
			if (find) {
				throw new Error("Content Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubContentRepository.create({ ...request })
			const result = await this.subjectSubContentRepository.save(data)
			if (!result) {
				throw new Error("Store Content Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string, subject_sub_id: any) {
		const subject_sub = await this.subjectSubRepository.findOne({ where: { id: subject_sub_id }, relations: ["subject"] })
		const data = await this.subjectSubContentRepository.findOne({ where: { id }, relations: ["subject_sub.subject"] })
		return {data,subject_sub}
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.subjectSubContentRepository.findOne({ where: { id: Not(id), subject_sub_id: request.subject_sub_id, name: request.name } })
			if (find) {
				throw new Error("Content Already Exists")
			}
			const subject_Sub = await this.subjectSubContentRepository.findOne({ where: { id } })
			if (!subject_Sub) {
				throw new Error('Content not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubContentRepository.merge(subject_Sub, { ...request })
			const result = await this.subjectSubContentRepository.save(data)
			if (!result) {
				throw new Error("Update Content Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async order_update(id: string, order: number) {
		try {
			if (order > 0) {
				const dataToMoveDown = await this.subjectSubContentRepository.findOne({ where: { id } })
				const dataToMoveUp = await this.subjectSubContentRepository.findOne({ where: { order_number: dataToMoveDown!.order_number + 1 } })
				if (!dataToMoveDown || !dataToMoveUp) {
					throw new Error('Data not found or invalid order numbers')
				}
				// Swap order_number antara data kedua dan ketiga
				await this.subjectSubContentRepository.update(dataToMoveDown.id, { order_number: dataToMoveUp.order_number })
				await this.subjectSubContentRepository.update(dataToMoveUp.id, { order_number: dataToMoveDown.order_number })
				return true
			} else {
				const dataToMoveUp = await this.subjectSubContentRepository.findOne({ where: { id } })
				const dataToMoveDown = await this.subjectSubContentRepository.findOne({ where: { order_number: dataToMoveUp!.order_number - 1 } })
				if (!dataToMoveDown || !dataToMoveUp) {
					throw new Error('Data not found or invalid order numbers')
				}
				// Swap order_number antara data kedua dan ketiga
				await this.subjectSubContentRepository.update(dataToMoveUp.id, { order_number: dataToMoveDown.order_number })
				await this.subjectSubContentRepository.update(dataToMoveDown.id, { order_number: dataToMoveUp.order_number })
				return true
			}
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.subjectSubContentRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.subjectSubContentRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}