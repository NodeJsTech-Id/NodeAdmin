import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { SubjectSub } from '../../../models/subject_sub.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { Subject } from '../../../models/subject.entity'
import { SubjectSubDetail } from '../../../models/subject_sub_detail.entity'

export default class SubjectSubService {
	private subjectRepository = AppDataSource.getRepository(Subject)
	private subjectSubRepository = AppDataSource.getRepository(SubjectSub)
	private subjectSubDetailRepository = AppDataSource.getRepository(SubjectSubDetail)

	public async index(filter: any) {
		const subject_id = filter.subject_id
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectSubRepository.createQueryBuilder('subject_subs')

		query = query.leftJoinAndSelect('subject_subs.subject','subjects')
		query = query.andWhere(`subject_subs.subject_id = :subject_id`, { subject_id })

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subject_subs.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`subject_subs.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const subject = await this.subjectRepository.findOne({ where: { id: subject_id } })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { datas:datas[0], paginate_data, subject }
	}

	public async create(subject_id: any) {
		const subject = await this.subjectRepository.findOne({ where: { id: subject_id } })
		return { subject }
	}

	public async store(request: any) {
		try {
			const find = await this.subjectSubRepository.findOne({ where: { subject_id: request.subject_id, name: request.name } })
			if (find) {
				throw new Error("Subject Sub Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubRepository.create({ ...request })
			const result = await this.subjectSubRepository.save(data)
			if (!result) {
				throw new Error("Store Subject Sub Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string, subject_id: any) {
		const subject = await this.subjectRepository.findOne({ where: { id: subject_id } })
		const data = await this.subjectSubRepository.findOne({ where: { id } })
		return {data,subject}
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.subjectSubRepository.findOne({ where: { id: Not(id), subject_id: request.subject_id, name: request.name } })
			if (find) {
				throw new Error("Subject Sub Already Exists")
			}
			const subject_Sub = await this.subjectSubRepository.findOne({ where: { id } })
			if (!subject_Sub) {
				throw new Error('Subject Sub not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubRepository.merge(subject_Sub, { ...request })
			const result = await this.subjectSubRepository.save(data)
			if (!result) {
				throw new Error("Update Subject Sub Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.subjectSubRepository.findOne({ where: { id }, relations: ["subject_sub_details"] })
		if (!data) {
			return false
		}
		const resultSubDetails = await this.subjectSubDetailRepository.remove(data.subject_sub_details)
		if (!resultSubDetails) {
			return false
		}
		const result = await this.subjectSubRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}