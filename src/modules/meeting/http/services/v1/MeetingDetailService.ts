import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { MeetingDetail } from '../../../models/meeting_detail.entity'
import { Meeting } from '../../../models/meeting.entity'
import { MeetingDetailPresence } from '../../../models/meeting_detail_presence.entity'
import ZoomService from '../../../../../services/zoomService'
import { User } from '../../../../access/models/user.entity'

const calculateMinutesDifference = (startTime: string, endTime: string): number => {
    // Memecah waktu menjadi jam, menit, dan detik
    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number)
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number)

    // Membuat objek Date dengan waktu yang diinginkan, menggunakan tanggal yang sama (misalnya, 1970-01-01)
    const startDate = new Date(1970, 0, 1, startHours, startMinutes, startSeconds)
    const endDate = new Date(1970, 0, 1, endHours, endMinutes, endSeconds)

    // Menghitung selisih waktu dalam milidetik
    const differenceInMilliseconds = endDate.getTime() - startDate.getTime()

    // Menghitung selisih waktu dalam menit
    const differenceInMinutes = differenceInMilliseconds / 1000 / 60

    return differenceInMinutes
}

export default class MeetingDetailService {
	private meetingDetailRepository = AppDataSource.getRepository(MeetingDetail)
	private meetingRepository = AppDataSource.getRepository(Meeting)
	private meetingDetailPresenceRepository = AppDataSource.getRepository(MeetingDetailPresence)
    private zoomService = new ZoomService

	public async index(filter: any, meeting_id: string) {
		const meeting = await this.meetingRepository.findOne({ where: { id: meeting_id }, relations: ["users"] })
		const meetingDetail = await this.meetingDetailRepository.createQueryBuilder('meeting_details')
		.innerJoin('meeting_details.meeting', 'meeting')
		.where('meeting.id = :meeting_id', { meeting_id })
		.getMany()
		meeting?.users.forEach(async (user) => {
			meetingDetail.forEach(async (md) => {
				const find = await this.meetingDetailPresenceRepository.findOne({
					where: {
						meeting_detail_id: md.id,
						user_id: user.id,
					}
				})
				if (!find) {
					const data = this.meetingDetailPresenceRepository.create({
						meeting_detail_id: md.id,
						user_id: user.id,
						status: "Absent",
					})
					await this.meetingDetailPresenceRepository.save(data)
				}
			})
		})

		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.meetingDetailRepository.createQueryBuilder('meeting_details')

		// relations
		query = query.leftJoinAndSelect('meeting_details.meeting','meeting')
		query.andWhere(`meeting_details.meeting_id = :meeting_id`, { meeting_id })

		// filter
		if (cleanConditions.date_start_start && cleanConditions.date_start_end) {
			query.andWhere(`meeting_details.date_start BETWEEN :date_start_start AND :date_start_end`, { date_start_start: cleanConditions.date_start_start, date_start_end: cleanConditions.date_start_end })
		}
		if (cleanConditions.date_end_start && cleanConditions.date_end_end) {
			query.andWhere(`meeting_details.date_end BETWEEN :date_end_start AND :date_end_end`, { date_end_start: cleanConditions.date_end_start, date_end_end: cleanConditions.date_end_end })
		}
		if (cleanConditions.time_start_start && cleanConditions.time_start_end) {
			query.andWhere(`meeting_details.time_start BETWEEN :time_start_start AND :time_start_end`, { time_start_start: cleanConditions.time_start_start, time_start_end: cleanConditions.time_start_end })
		}
		if (cleanConditions.time_end_start && cleanConditions.time_end_end) {
			query.andWhere(`meeting_details.time_end BETWEEN :time_end_start AND :time_end_end`, { time_end_start: cleanConditions.time_end_start, time_end_end: cleanConditions.time_end_end })
		}
		if (cleanConditions.meeting_code) {
			query.andWhere(`meeting_details.meeting_code LIKE :meeting_code`, { meeting_code: `%${cleanConditions.meeting_code}%` })
		}
		if (cleanConditions.status) {
			query.andWhere(`meeting_details.status = :status`, { status: cleanConditions.status })
		}
		if (cleanConditions.desc) {
			query.andWhere(`meeting_details.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}

		query = query.addOrderBy('meeting_details.date_start','DESC').addOrderBy('meeting_details.time_start','DESC')

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

	public async store(request: any, meeting_id: string) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				request = functions.removeEmptyFields(request)
				const meetingDetail = transactionalEntityManager.create(MeetingDetail, {
					...request,
					meeting_id,
					duration: calculateMinutesDifference(request.time_start+":00",request.time_end+":00")
				})
				const result = await transactionalEntityManager.save(meetingDetail)
				if (!result) {
					throw new Error("Store Meeting Detail Fail")
				}
				return result
			} catch (error: any) {
				console.log(error)
				throw error
			}
		})
	}

	public async edit(id: string) {
		const data = await this.meetingDetailRepository.findOne({ where: { id }, relations: ["meeting.class"] })
		return { data }
	}

	public async update(id: string, request: any) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				const meetingDetail = await this.meetingDetailRepository.findOne({ where: { id } })
				if (!meetingDetail) {
					throw new Error('Meeting Detail not found')
				}
				request = functions.removeEmptyFields(request)
				const data = this.meetingDetailRepository.merge(meetingDetail, {
					...request,
					duration: calculateMinutesDifference(request.time_start+":00",request.time_end+":00")
				})
				const result = await transactionalEntityManager.save(data)
				if (!result) {
					throw new Error("Update Meeting Detail Fail")
				}
				return result
			} catch (error: any) {
				throw error
			}
		})
	}

	public async delete(id: string) {
		const data = await this.meetingDetailRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.meetingDetailRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}

	public async user_presences(id: string) {
		try {
			const meetingDetailPresence = await this.meetingDetailPresenceRepository.find({ where: { meeting_detail_id: id }, relations: ["user"] })
			if (!meetingDetailPresence) {
				throw new Error('Meeting Detail Presence not found')
			}
			const users = meetingDetailPresence
			return { users }
		} catch (error: any) {
			return error
		}
	}

	public async user_presences_update(id: string, status: any, desc: string = "") {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				const meetingDetailPresence = await this.meetingDetailPresenceRepository.findOne({ where: { id } })
				if (!meetingDetailPresence) {
					throw new Error('Meeting Detail Presence not found')
				}
				let data
				if (desc === "") {
					data = this.meetingDetailPresenceRepository.merge(meetingDetailPresence, { status })
				} else {
					data = this.meetingDetailPresenceRepository.merge(meetingDetailPresence, { status, desc })
				}
				const result = await transactionalEntityManager.save(data)
				if (!result) {
					throw new Error("Update Meeting Detail Presence Fail")
				}
				return result
			} catch (error: any) {
				throw error
			}
		})
	}

	public async start_meeting(id: string) {
		try {
			const result = await AppDataSource.transaction(async (transactionalEntityManager) => {
				try {
					const meetingDetail = await transactionalEntityManager.findOne(MeetingDetail, { where: { id }, relations: ["meeting.class"] })
					if (!meetingDetail) {
						throw new Error('Meeting Detail not found')
					}
					if (meetingDetail.status === 'Finished') {
						throw new Error('Meeting Already Finish')
					}
					const createMeetingApi = await this.zoomService.createMeeting({
						topic: meetingDetail?.meeting.class.name,
						start_time: meetingDetail?.date_start+" "+meetingDetail?.time_start,
						duration: meetingDetail?.duration
					})
					if (!createMeetingApi) {
						throw new Error('Create Zoom Meeting Fail')
					}
					const data = transactionalEntityManager.merge(MeetingDetail, meetingDetail, {
						meeting_code: String(createMeetingApi.id),
						credential: createMeetingApi,
						status: "On Going",
					})
					const result = await transactionalEntityManager.save(data)
					if (!result) {
						throw new Error('Meeting Start Fail')
					}
					return result
				} catch (error: any) {
					throw error
				}
			})
			if (result instanceof Error) {
				throw new Error('Meeting Detail not found')
			} else {
				return result
			}
		} catch (error: any) {
			return error
		}
	}

	public async generate_join_token(id: string, user: User) {
		const meetingDetail = await this.meetingDetailRepository.findOne({ where: { id }, relations: ["meeting.mentor"] })
		if (!meetingDetail) {
			throw new Error('Meeting Detail not found')
		}
		let role = 0
		if (meetingDetail.meeting.mentor_id == user.id) {
			role = 1
		}
		return this.zoomService.generateTokenJoin({ meeting_number: meetingDetail.meeting_code, role })
	}

	public async finish_meeting(id: string, user: User) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				const meetingDetail = await this.meetingDetailRepository.findOne({ where: { id }, relations: ["meeting"] })
				if (!meetingDetail) {
					throw new Error('Meeting Detail not found')
				}
				if (meetingDetail.meeting.mentor_id === user.id) {
					const data = this.meetingDetailRepository.merge(meetingDetail, {
						status: "Finished"
					})
					const result = await transactionalEntityManager.save(data)
					if (!result) {
						throw new Error("Update Meeting Detail Fail")
					}
					return result
				} else {
					return true
				}
			} catch (error: any) {
				throw error
			}
		})
	}
}