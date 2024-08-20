import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { SubjectSub } from '../../../models/subject_sub.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { SubjectSubDetail } from '../../../models/subject_sub_detail.entity'

export default class SubjectSubDetailService {
	private subjectSubRepository = AppDataSource.getRepository(SubjectSub)
	private subjectSubDetailRepository = AppDataSource.getRepository(SubjectSubDetail)

	public async index(filter: any) {
		const subject_sub_id = filter.subject_sub_id
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectSubDetailRepository.createQueryBuilder('subject_sub_details')

		query = query.leftJoinAndSelect('subject_sub_details.subject_sub','subject_subs')
		.leftJoinAndSelect('subject_subs.subject', 'subject')
		query = query.andWhere(`subject_sub_details.subject_sub_id = :subject_sub_id`, { subject_sub_id })

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subject_sub_details.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`subject_sub_details.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
		query = query.addOrderBy("subject_sub_details.order_number","ASC")

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
			const find = await this.subjectSubDetailRepository.findOne({ where: { subject_sub_id: request.subject_sub_id, name: request.name } })
			if (find) {
				throw new Error("Subject Sub Detail Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubDetailRepository.create({ ...request })
			const result = await this.subjectSubDetailRepository.save(data)
			if (!result) {
				throw new Error("Store Subject Sub Detail Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string,subject_sub_id: any) {
		const subject_sub = await this.subjectSubRepository.findOne({ where: { id: subject_sub_id }, relations: ["subject"] })
		const data = await this.subjectSubDetailRepository.findOne({ where: { id } })
		return {data,subject_sub}
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.subjectSubDetailRepository.findOne({ where: { id: Not(id), subject_sub_id: request.subject_sub_id, name: request.name } })
			if (find) {
				throw new Error("Subject Sub Detail Already Exists")
			}
			const subject_Sub = await this.subjectSubDetailRepository.findOne({ where: { id } })
			if (!subject_Sub) {
				throw new Error('Subject Sub Detail not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubDetailRepository.merge(subject_Sub, { ...request })
			const result = await this.subjectSubDetailRepository.save(data)
			if (!result) {
				throw new Error("Update Subject Sub Detail Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async order_update(id: string, order: number) {
		try {
			if (order > 0) {
				const dataToMoveDown = await this.subjectSubDetailRepository.findOne({ where: { id } })
				const dataToMoveUp = await this.subjectSubDetailRepository.findOne({ where: { order_number: dataToMoveDown!.order_number + 1 } })
				if (!dataToMoveDown || !dataToMoveUp) {
					throw new Error('Data not found or invalid order numbers')
				}
				// Swap order_number antara data kedua dan ketiga
				await this.subjectSubDetailRepository.update(dataToMoveDown.id, { order_number: dataToMoveUp.order_number })
				await this.subjectSubDetailRepository.update(dataToMoveUp.id, { order_number: dataToMoveDown.order_number })
				return true
			} else {
				const dataToMoveUp = await this.subjectSubDetailRepository.findOne({ where: { id } })
				const dataToMoveDown = await this.subjectSubDetailRepository.findOne({ where: { order_number: dataToMoveUp!.order_number - 1 } })
				if (!dataToMoveDown || !dataToMoveUp) {
					throw new Error('Data not found or invalid order numbers')
				}
				// Swap order_number antara data kedua dan ketiga
				await this.subjectSubDetailRepository.update(dataToMoveUp.id, { order_number: dataToMoveDown.order_number })
				await this.subjectSubDetailRepository.update(dataToMoveDown.id, { order_number: dataToMoveUp.order_number })
				return true
			}
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.subjectSubDetailRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.subjectSubDetailRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}