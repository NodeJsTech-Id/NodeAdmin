import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { SubjectSub } from '../../../models/subject_sub.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { SubjectSubDetail } from '../../../models/subject_sub_detail.entity'
import { Subject } from '../../../models/subject.entity'

export default class SubjectSubDetailService {
	private subjectRepository = AppDataSource.getRepository(Subject)
	private subjectSubRepository = AppDataSource.getRepository(SubjectSub)
	private subjectSubDetailRepository = AppDataSource.getRepository(SubjectSubDetail)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectSubDetailRepository.createQueryBuilder('subject_sub_details')

		query = query.leftJoinAndSelect('subject_sub_details.subject_sub','subject_subs')
		.leftJoinAndSelect('subject_subs.subject', 'subject')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subject_sub_details.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`subject_sub_details.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
		if (cleanConditions.subject_sub_id) {
			query = query.andWhere(`subject_sub_details.subject_sub_id = :subject_sub_id`, { subject_sub_id: cleanConditions.subject_sub_id })
		}
		if (cleanConditions.subject_id) {
			query = query.andWhere(`subject_subs.subject_id = :subject_id`, { subject_id: cleanConditions.subject_id })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const subjects = await this.subjectRepository.find()
		const subject_subs = await this.subjectSubRepository.find()
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { datas:datas[0], paginate_data, subjects, subject_subs }
	}

	public async create() {
		const subject_subs = await this.subjectSubRepository.find()
		return { subject_subs }
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

	public async edit(id: string) {
		const subject_subs = await this.subjectSubRepository.find()
		const data = await this.subjectSubDetailRepository.findOne({ where: { id } })
		return {data,subject_subs}
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