import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Schedule } from '../../../models/schedule.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'

export default class ScheduleService {
	private scheduleRepository = AppDataSource.getRepository(Schedule)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.scheduleRepository.createQueryBuilder('schedules')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`schedules.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.day) {
			query = query.andWhere(`schedules.day = :day`, { day: cleanConditions.day })
		}
		if (cleanConditions.start_start && cleanConditions.start_end) {
			query = query.andWhere(`schedules.start BETWEEN :start_start AND :start_end`, { start_start: `${cleanConditions.start_start}`, start_end: `${cleanConditions.start_end}` })
		}
		if (cleanConditions.end_start && cleanConditions.end_end) {
			query = query.andWhere(`schedules.end BETWEEN :end_start AND :end_end`, { end_start: `${cleanConditions.end_start}`, end_end: `${cleanConditions.end_end}` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`schedules.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
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
			const find = await this.scheduleRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Schedule Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.scheduleRepository.create({ ...request })
			const result = await this.scheduleRepository.save(data)
			if (!result) {
				throw new Error("Store Schedule Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async edit(id: string) {
		const data = await this.scheduleRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.scheduleRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Schedule Already Exists")
			}
			const schedule = await this.scheduleRepository.findOne({ where: { id } })
			if (!schedule) {
				throw new Error('Schedule not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.scheduleRepository.merge(schedule, { ...request })
			const result = await this.scheduleRepository.save(data)
			if (!result) {
				throw new Error("Update Schedule Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}

	public async delete(id: string) {
		const data = await this.scheduleRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.scheduleRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}
}