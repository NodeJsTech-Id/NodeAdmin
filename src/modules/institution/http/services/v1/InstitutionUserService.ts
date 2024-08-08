import AppDataSource from "../../../../../config/ormconfig"
import functions, { removePrefix } from "../../../../../helpers/functions"
import { User } from "../../../../access/models/user.entity"
import { Institution } from "../../../models/institution.entity"
import { InstitutionUser } from "../../../models/institution_user.entity"

export default class InstitutionUserService {
    private institutionUserRepository = AppDataSource.getRepository(InstitutionUser)
    private institutionRepository = AppDataSource.getRepository(Institution)
    private userRepository = AppDataSource.getRepository(User)

    public async index(institution_id: string, filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.institutionUserRepository.createQueryBuilder('institution_users')

		query = query.leftJoinAndSelect('institution_users.user','user')
        query.andWhere(`institution_users.institution_id = :institution_id`, { institution_id })

		// filter
		if (cleanConditions.code) {
			query = query.andWhere(`user.code LIKE :code`, { code: `%${cleanConditions.code}%` })
		}
		if (cleanConditions.name) {
			query = query.andWhere(`user.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.phone) {
			query = query.andWhere(`user.phone LIKE :phone`, { phone: `%${cleanConditions.phone}%` })
		}
		if (cleanConditions.email) {
			query = query.andWhere(`user.email LIKE :email`, { email: `%${cleanConditions.email}%` })
		}
        if (cleanConditions.status) {
			query = query.andWhere(`institution_users.status = :status`, { status: cleanConditions.status })
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
        const institution = await this.institutionRepository.findOne({ where: { id: institution_id } })
		return { institution, datas:datas[0], paginate_data }
	}

    public async create(institution_id: string) {
        const institution = await this.institutionRepository.findOne({ where: { id: institution_id } })
        const users = await this.userRepository.find()
        return { institution, users }
    }

    public async store(institution_id: string, request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const data = transactionalEntityManager.create(InstitutionUser, { ...request, institution_id })
                const result = transactionalEntityManager.save(data)
                if (!result) {
					throw new Error("Store Fail")
				}
				return result
            } catch (error: any) {
                throw error
            }
        })
    }

    public async edit(institution_id: string, id: string) {
        const institution = await this.institutionRepository.findOne({ where: { id: institution_id } })
        const data = await this.institutionUserRepository.findOne({ where: { id }, relations: ["user"] })
        return { data, institution }
    }

    public async update(institution_id: string, id: string, request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const find = await transactionalEntityManager.findOne(InstitutionUser, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const data = transactionalEntityManager.merge(InstitutionUser, find, { ...request, institution_id })
                const result = await transactionalEntityManager.save(data)
                if (!result) {
                    throw new Error("Update Fail")
                }
                return result
            } catch (error: any) {
                throw error
            }
        })
    }
    public async delete(id: string) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                const find = await transactionalEntityManager.findOne(InstitutionUser, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const result = transactionalEntityManager.remove(InstitutionUser, find)
                if (!result) {
                    throw new Error("Delete Fail")
                }
                return result
            } catch (error: any) {
                throw error
            }
        })
    }
}