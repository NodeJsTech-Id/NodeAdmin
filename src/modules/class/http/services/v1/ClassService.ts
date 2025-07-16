import { In, Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Class } from '../../../models/class.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { Subject } from '../../../../subject/models/subject.entity'
import { User } from '../../../../access/models/user.entity'

export default class ClassService {
	private classRepository = AppDataSource.getRepository(Class)
	private subjectRepository = AppDataSource.getRepository(Subject)
	private userRepository = AppDataSource.getRepository(User)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.classRepository.createQueryBuilder('classes')
					.leftJoinAndSelect('classes.users', 'users')
					.leftJoinAndSelect('classes.mentors', 'mentors')

		if (cleanConditions.user) {
			query = query.andWhere(`users.id = :user`, { user: cleanConditions.user })
		}
		if (cleanConditions.mentor) {
			query = query.andWhere(`mentors.id = :mentor`, { mentor: cleanConditions.mentor })
		}

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`classes.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`classes.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
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
			const find = await this.classRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Class Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.classRepository.create({ ...request })
			const result = await this.classRepository.save(data)
			if (!result) {
				throw new Error("Store Class Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async edit(id: string) {
		const data = await this.classRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.classRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Class Already Exists")
			}
			const classData = await this.classRepository.findOne({ where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.classRepository.merge(classData, { ...request })
			const result = await this.classRepository.save(data)
			if (!result) {
				throw new Error("Update Class Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete(id: string) {
		const data = await this.classRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.classRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}

	// class subject
	public async index_subject(id: string, filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectRepository.createQueryBuilder('subjects')

		query = query.leftJoinAndSelect('subjects.classes','classes')
					.leftJoinAndSelect('subjects.subject_subs', 'subject_subs')
					.leftJoinAndSelect('subject_subs.subject_sub_contents', 'subject_sub_contents')
		query = query.andWhere(`classes.id = '${id}'`)

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`subjects.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`subjects.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const classData = await this.classRepository.findOne({ where: { id } })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { classData, datas:datas[0], paginate_data }
	}

	public async create_subject(id: string) {
		const classData = await this.classRepository.findOne({ where: { id } })
		const subjects = await this.subjectRepository.find()
		return {classData,subjects}
	}

	public async store_subject(id: string, request: any) {
		try {
			const classData = await this.classRepository.findOne({ relations: ['subjects'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			const subject = await this.subjectRepository.findOneBy({ id: request.subject_id })
			if (!subject) {
				throw new Error("Subject Not Found")
			}
			classData.subjects.push(subject)
			const data = this.classRepository.merge(classData)
			const result = await this.classRepository.save(data)
			if (!result) {
				throw new Error("Add Subject Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete_subject(id: string, subject_id: string) {
		try {
			const classData = await this.classRepository.findOne({ relations: ['subjects'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			classData.subjects = classData.subjects.filter((subject: { id: string }) => subject.id !== subject_id)
			const result = await this.classRepository.save(classData)
			if (!result) {
				throw new Error("Remove Subject Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}
	// end class subject

	// class user
	public async index_user(id: string, filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.userRepository.createQueryBuilder('users')

		query = query.leftJoinAndSelect('users.classes','classes')
		query = query.andWhere(`classes.id = '${id}'`)

		// filter
		if (cleanConditions.code) {
			query = query.andWhere(`users.code LIKE :code`, { code: `%${cleanConditions.code}%` })
		}
		if (cleanConditions.name) {
			query = query.andWhere(`users.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.phone) {
			query = query.andWhere(`users.phone LIKE :phone`, { phone: `%${cleanConditions.phone}%` })
		}
		if (cleanConditions.email) {
			query = query.andWhere(`users.email LIKE :email`, { email: `%${cleanConditions.email}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const classData = await this.classRepository.findOne({ where: { id } })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { classData, datas:datas[0], paginate_data }
	}

	public async create_user(id: string) {
		const classData = await this.classRepository.findOne({ where: { id } })
		const users = await this.userRepository.find()
		return {classData,users}
	}

	public async store_user(id: string, request: any) {
		try {
			const classData = await this.classRepository.findOne({ relations: ['users'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			const user = await this.userRepository.findOneBy({ id: request.user_id })
			if (!user) {
				throw new Error("User Not Found")
			}
			classData.users.push(user)
			const data = this.classRepository.merge(classData)
			const result = await this.classRepository.save(data)
			if (!result) {
				throw new Error("Add User Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete_user(id: string, user_id: string) {
		try {
			console.log(user_id)
			const classData = await this.classRepository.findOne({ relations: ['users'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			classData.users = classData.users.filter((user: { id: string }) => user.id !== user_id)
			const result = await this.classRepository.save(classData)
			if (!result) {
				throw new Error("Remove User Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}
	// end class user

	// class mentor
	public async index_mentor(id: string, filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.userRepository.createQueryBuilder('users')

		query = query.leftJoinAndSelect('users.class_mentored','class_mentored')
		query = query.andWhere(`class_mentored.id = '${id}'`)

		// filter
		if (cleanConditions.code) {
			query = query.andWhere(`users.code LIKE :code`, { code: `%${cleanConditions.code}%` })
		}
		if (cleanConditions.name) {
			query = query.andWhere(`users.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.phone) {
			query = query.andWhere(`users.phone LIKE :phone`, { phone: `%${cleanConditions.phone}%` })
		}
		if (cleanConditions.email) {
			query = query.andWhere(`users.email LIKE :email`, { email: `%${cleanConditions.email}%` })
		}

		query = query.skip(!cleanConditions.page?0:(parseInt(cleanConditions.page)-1)*parseInt(cleanConditions.page_size??10))
			.take(cleanConditions.page_size??10)

		// get data
		const classData = await this.classRepository.findOne({ where: { id } })
		const datas = await query.getManyAndCount()
		const paginate_data = {
			total_data: datas[1],
			page_size: parseInt(cleanConditions.page_size??10),
			current_page: parseInt(cleanConditions.page??1),
			total_page: Math.ceil(datas[1] / parseInt(cleanConditions.page_size??10)),
		}
		return { classData, datas:datas[0], paginate_data }
	}

	public async create_mentor(id: string) {
		const classData = await this.classRepository.findOne({ where: { id } })
		const users = await this.userRepository.createQueryBuilder('users')
		.innerJoin('users.roles', 'role')
		.where('role.name = :name', { name: "Mentor" })
		.getMany()
		return {classData,users}
	}

	public async store_mentor(id: string, request: any) {
		try {
			const classData = await this.classRepository.findOne({ relations: ['mentors'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			const user = await this.userRepository.findOneBy({ id: request.user_id })
			if (!user) {
				throw new Error("Mentor Not Found")
			}
			classData.mentors.push(user)
			const data = this.classRepository.merge(classData)
			const result = await this.classRepository.save(data)
			if (!result) {
				throw new Error("Add Mentor Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete_mentor(id: string, user_id: string) {
		try {
			console.log(user_id)
			const classData = await this.classRepository.findOne({ relations: ['mentors'], where: { id } })
			if (!classData) {
				throw new Error('Class not found')
			}
			classData.mentors = classData.mentors.filter((user: { id: string }) => user.id !== user_id)
			const result = await this.classRepository.save(classData)
			if (!result) {
				throw new Error("Remove Mentor Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}
	// end class mentor
}