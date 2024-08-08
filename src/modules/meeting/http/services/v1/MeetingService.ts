import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { Meeting } from '../../../models/meeting.entity'
import { Class } from '../../../../class/models/class.entity'
import { Room } from '../../../../room/models/room.entity'
import { Schedule } from '../../../../schedule/models/schedule.entity'
import { User } from '../../../../access/models/user.entity'
import { In } from 'typeorm'
import app from '../../../../../config/app'
import { MeetingDetail } from '../../../models/meeting_detail.entity'

const isEmpty = (obj: any) => {
    return Object.keys(obj).length === 0
}

const getKeyByValue = (object: { [key: number]: string }, value: string): number | null => {
    for (const [key, val] of Object.entries(object)) {
        if (val === value) {
            return parseInt(key)
        }
    }
    return null
}

const getDatesByDay = (startDate: string, endDate: string, daysOfWeek: number[], meeting_number: number): string[] => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const result: string[] = []
	let count0 = 0
	let count1 = 0
	let count2 = 0
	let count3 = 0
	let count4 = 0
	let count5 = 0
	let count6 = 0

    // Iterasi dari tanggal mulai hingga tanggal akhir
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        // Jika hari dalam minggu (0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu) ada dalam daysOfWeek, tambahkan ke hasil
        if (dt.getDay() == 0 && daysOfWeek.includes(dt.getDay())) {
			if (count0 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count0++
        }
		if (dt.getDay() == 1 && daysOfWeek.includes(dt.getDay())) {
			if (count1 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count1++
        }
		if (dt.getDay() == 2 && daysOfWeek.includes(dt.getDay())) {
			if (count2 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count2++
        }
		if (dt.getDay() == 3 && daysOfWeek.includes(dt.getDay())) {
			if (count3 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count3++
        }
		if (dt.getDay() == 4 && daysOfWeek.includes(dt.getDay())) {
			if (count4 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count4++
        }
		if (dt.getDay() == 5 && daysOfWeek.includes(dt.getDay())) {
			if (count5 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count5++
        }
		if (dt.getDay() == 6 && daysOfWeek.includes(dt.getDay())) {
			if (count6 < meeting_number) {
				result.push(new Date(dt).toISOString().split('T')[0])
			}
			count6++
        }
    }

    return result
}

const getDayName = (dateString: string): string => {
    const date = new Date(dateString)
    const dayIndex = date.getDay() // Mendapatkan indeks hari (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
    return app.days[dayIndex] // Mengembalikan nama hari berdasarkan indeks
}

function pushIfNotExists<T>(array: T[], item: T): void {
    if (!array.includes(item)) {
        array.push(item)
    }
}

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

export default class MeetingService {
	private meetingRepository = AppDataSource.getRepository(Meeting)
	private meetingDetailRepository = AppDataSource.getRepository(MeetingDetail)
	private roomRepository = AppDataSource.getRepository(Room)
	private classRepository = AppDataSource.getRepository(Class)
	private scheduleRepository = AppDataSource.getRepository(Schedule)
	private userRepository = AppDataSource.getRepository(User)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.meetingRepository.createQueryBuilder('meetings')

		// relations
		query = query.leftJoinAndSelect('meetings.room','room')
		query = query.leftJoinAndSelect('meetings.class','class')
		query = query.leftJoinAndSelect('meetings.schedules','schedules')
		query = query.leftJoinAndSelect('meetings.users','users')
		query = query.leftJoinAndSelect('meetings.mentor','mentor')

		// filter
		if (cleanConditions.meeting_number_operator && cleanConditions.meeting_number) {
			query.andWhere(`meetings.meeting_number :meeting_number_operator :meeting_number`, { meeting_number_operator: cleanConditions.meeting_number_operator, meeting_number: cleanConditions.meeting_number })
		}
		if (cleanConditions.date_start_start && cleanConditions.date_start_end) {
			query.andWhere(`meetings.date_start BETWEEN :date_start_start AND :date_start_end`, { date_start_start: cleanConditions.date_start_start, date_start_end: cleanConditions.date_start_end })
		}
		if (cleanConditions.date_end_start && cleanConditions.date_end_end) {
			query.andWhere(`meetings.date_end BETWEEN :date_end_start AND :date_end_end`, { date_end_start: cleanConditions.date_end_start, date_end_end: cleanConditions.date_end_end })
		}
		if (cleanConditions.desc) {
			query.andWhere(`meetings.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
		if (cleanConditions.status) {
			query.andWhere(`meetings.status = :status`, { status: cleanConditions.status })
		}
		if (cleanConditions.room_id) {
			query.andWhere(`room.id = :room_id`, { room_id: cleanConditions.room_id })
		}
		if (cleanConditions.class_id) {
			query.andWhere(`class.id = :class_id`, { class_id: cleanConditions.class_id })
		}
		if (cleanConditions.schedule_id) {
			query.andWhere(`schedules.id = :schedule_id`, { schedule_id: cleanConditions.schedule_id })
		}
		if (cleanConditions.user_id) {
			query.andWhere(`users.id = :user_id`, { user_id: cleanConditions.user_id })
		}
		if (cleanConditions.mentor_id) {
			query.andWhere(`mentor.id = :mentor_id`, { mentor_id: cleanConditions.mentor_id })
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
		const users = await this.userRepository.createQueryBuilder('users')
		.innerJoin('users.roles', 'role')
		.where('role.name = :name', { name: "Mentor" })
		.getMany()
		const rooms = await this.roomRepository.find()
		const classes = await this.classRepository.find()
		const schedules = await this.scheduleRepository.find()
		return { datas:datas[0], paginate_data, rooms, classes, schedules, users }
	}

	public async create() {
		const rooms = await this.roomRepository.find()
		const classes = await this.classRepository.find()
		const schedules = await this.scheduleRepository.find()
		const users = await this.userRepository.createQueryBuilder('users')
		.innerJoin('users.roles', 'role')
		.where('role.name = :name', { name: "Mentor" })
		.getMany()
		return { rooms, classes, schedules, users }
	}

	public async store(request: any) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				const schedules = await this.scheduleRepository.findBy({ id: In(request.schedules) })
				if (!schedules.length) {
					throw new Error("Schedules Not Found")
				}
				request = functions.removeEmptyFields(request)
				const meeting = transactionalEntityManager.create(Meeting, { ...request, schedules })
				const result = await transactionalEntityManager.save(meeting)
				if (!result) {
					throw new Error("Store Meeting Fail")
				}

				let days: any[] = []
				schedules.forEach(e => {
					pushIfNotExists(days,getKeyByValue(app.days,e.day))
				})
				const dates = getDatesByDay(request.date_start,request.date_end,days,request.meeting_number)
				dates.forEach(async (date: string) => {
					schedules.forEach(async (schedule: Schedule) => {
						if (schedule.day === getDayName(date)) {
							const dataDetail = transactionalEntityManager.create(MeetingDetail, {
								meeting_id: result.id,
								date_start: date,
								date_end: date,
								time_start: schedule.start,
								time_end: schedule.end,
								duration: calculateMinutesDifference(schedule.start,schedule.end),
								status: "Not Start"
							})
							const resultSchedule = await transactionalEntityManager.save(dataDetail)
							if (!resultSchedule) {
								throw new Error("Store Meeting Detail Fail")
							}
						}
					})
				})
				return result
			} catch (error: any) {
				throw error
			}
		})
	}

	public async edit(id: string) {
		const rooms = await this.roomRepository.find()
		const classes = await this.classRepository.find()
		const schedules = await this.scheduleRepository.find()
		const data = await this.meetingRepository.findOne({ where: { id }, relations: ['schedules'] })
		return { data, rooms, classes, schedules }
	}

	public async update(id: string, request: any) {
		return await AppDataSource.transaction(async (transactionalEntityManager) => {
			try {
				const meeting = await this.meetingRepository.findOne({ where: { id } })
				if (!meeting) {
					throw new Error('Meeting not found')
				}
				const schedules = await this.scheduleRepository.findBy({ id: In(request.schedules) })
				if (!schedules.length) {
					throw new Error("Schedules Not Found")
				}
				request = functions.removeEmptyFields(request)
				const data = this.meetingRepository.merge(meeting, { ...request, schedules })
				const result = await transactionalEntityManager.save(data)
				if (!result) {
					throw new Error("Update Meeting Fail")
				}

				let days: any[] = []
				schedules.forEach(e => {
					pushIfNotExists(days,getKeyByValue(app.days,e.day))
				})
				const dates = getDatesByDay(request.date_start,request.date_end,days,request.meeting_number)
				dates.forEach(async (date: string) => {
					schedules.forEach(async (schedule: Schedule) => {
						if (schedule.day === getDayName(date) && new Date(date).getTime() > new Date().getTime()) {
							const dataDetail = transactionalEntityManager.create(MeetingDetail, {
								meeting_id: result.id,
								date_start: date,
								date_end: date,
								time_start: schedule.start,
								time_end: schedule.end,
								duration: calculateMinutesDifference(schedule.start,schedule.end),
								status: "Not Start",
							})
							if (!await transactionalEntityManager.exists(MeetingDetail,{where: dataDetail})) {
								const resultSchedule = await transactionalEntityManager.save(dataDetail)
								if (!resultSchedule) {
									throw new Error("Store Meeting Detail Fail")
								}
							}
						}
					})
				})
				return result
			} catch (error: any) {
				throw error
			}
		})
	}

	public async delete(id: string) {
		const dataDetail = await this.meetingDetailRepository.find({ where: { id } })
		if (!dataDetail) {
			return false
		}
		const resultDetail = await this.meetingDetailRepository.remove(dataDetail)
		if (!resultDetail) {
			return false
		}

		const data = await this.meetingRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.meetingRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}

	public async meeting_users(id: string) {
		try {
			const meeting = await this.meetingRepository.findOne({ where: { id }, relations: ["users","class.users"] })
			if (!meeting) {
				throw new Error('Meeting not found')
			}
			const users = meeting.class.users
			return { meeting, users }
		} catch (error: any) {
			return error
		}
	}

	public async meeting_users_assign(id: string, request: any) {
		try {
			let meeting = await this.meetingRepository.findOne({ where: { id }, relations: ["users"] })
			if (!meeting) {
				throw new Error('Meeting not found')
			}
			if (isEmpty(request)) {
				meeting.users = []
			} else {
				const users = await this.userRepository.findBy({ id: In(request.users) })
				if (!users.length) {
					throw new Error("Users Not Found")
				}
				meeting.users = users
			}
			const result = await this.meetingRepository.save(meeting)
			if (!result) {
				throw new Error("Update Meeting Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async meeting_mentor(id: string) {
		try {
			const meeting = await this.meetingRepository.findOne({ where: { id }, relations: ["class.mentors"] })
			if (!meeting) {
				throw new Error('Meeting not found')
			}
			const users = meeting.class.mentors
			return { meeting, users }
		} catch (error: any) {
			return error
		}
	}

	public async meeting_mentor_assign(id: string, request: any) {
		try {
			const meeting = await this.meetingRepository.findOne({ where: { id } })
			if (!meeting) {
				throw new Error('Meeting not found')
			}
			const data = this.meetingRepository.merge(meeting, { ...request })
			const result = await this.meetingRepository.save(meeting)
			if (!result) {
				throw new Error("Update Meeting Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}
}