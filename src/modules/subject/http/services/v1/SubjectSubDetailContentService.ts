import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { SubjectSubDetail } from '../../../models/subject_sub_detail.entity'
import { SubjectSubDetailContent } from '../../../models/subject_sub_detail_content.entity'

export default class SubjectSubDetailContentService {
	private subjectSubDetailRepository = AppDataSource.getRepository(SubjectSubDetail)
	private subjectSubDetailContentRepository = AppDataSource.getRepository(SubjectSubDetailContent)

	public async index(filter: any) {
		const subject_sub_detail_id = filter.subject_sub_detail_id
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectSubDetailContentRepository.createQueryBuilder('subject_sub_detail_contents')

		query = query.leftJoinAndSelect('subject_sub_detail_contents.subject_sub_detail','subject_sub_details')
		.leftJoinAndSelect('subject_sub_details.subject_sub', 'subject_sub_detail')
		query = query.andWhere(`subject_sub_detail_contents.subject_sub_detail_id = :subject_sub_detail_id`, { subject_sub_detail_id })

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subject_sub_detail_contents.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const subject_sub_detail = await this.subjectSubDetailRepository.findOne({ where: { id: subject_sub_detail_id }, relations: ["subject_sub.subject"] })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { datas:datas[0], paginate_data, subject_sub_detail }
	}

	public async create(subject_sub_detail_id: any) {
		const subject_sub_detail = await this.subjectSubDetailRepository.findOne({ where: { id: subject_sub_detail_id }, relations: ["subject_sub.subject"] })
		return { subject_sub_detail }
	}

	public async store(request: any) {
		try {
			const find = await this.subjectSubDetailContentRepository.findOne({ where: { subject_sub_detail_id: request.subject_sub_detail_id, name: request.name } })
			if (find) {
				throw new Error("Content Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubDetailContentRepository.create({ ...request })
			const result = await this.subjectSubDetailContentRepository.save(data)
			if (!result) {
				throw new Error("Store Content Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string, subject_sub_detail_id: any) {
		const subject_sub_detail = await this.subjectSubDetailRepository.findOne({ where: { id: subject_sub_detail_id }, relations: ["subject_sub.subject"] })
		const data = await this.subjectSubDetailContentRepository.findOne({ where: { id }, relations: ["subject_sub_detail.subject_sub.subject"] })
		return {data,subject_sub_detail}
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.subjectSubDetailContentRepository.findOne({ where: { id: Not(id), subject_sub_detail_id: request.subject_sub_detail_id, name: request.name } })
			if (find) {
				throw new Error("Content Already Exists")
			}
			const subject_Sub = await this.subjectSubDetailContentRepository.findOne({ where: { id } })
			if (!subject_Sub) {
				throw new Error('Content not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.subjectSubDetailContentRepository.merge(subject_Sub, { ...request })
			const result = await this.subjectSubDetailContentRepository.save(data)
			if (!result) {
				throw new Error("Update Content Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.subjectSubDetailContentRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.subjectSubDetailContentRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}