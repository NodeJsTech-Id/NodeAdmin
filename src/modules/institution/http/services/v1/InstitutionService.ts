import AppDataSource from "../../../../../config/ormconfig"
import functions, { removePrefix } from "../../../../../helpers/functions"
import { User } from "../../../../access/models/user.entity"
import { Promotion } from "../../../../promotion/models/v1/promotion.entity"
import { Institution } from "../../../models/institution.entity"

export default class InstitutionService {
    private institutionRepository = AppDataSource.getRepository(Institution)
    private userRepository = AppDataSource.getRepository(User)
    private promotionRepository = AppDataSource.getRepository(Promotion)

    public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.institutionRepository.createQueryBuilder('institutions')
            .leftJoinAndSelect('institutions.user','user')
            .leftJoinAndSelect('institutions.users','users')
            .loadRelationCountAndMap(
                'institutions.usersCountAcc',
                'institutions.users',
                'users', 
                (qb) => qb.where('users.status = :status', { status: "Accepted" })
            )
            .loadRelationCountAndMap(
                'institutions.usersCountWait',
                'institutions.users',
                'users', 
                (qb) => qb.where('users.status = :status', { status: "Waiting" })
            )
            .loadRelationCountAndMap(
                'institutions.usersCountDcl',
                'institutions.users',
                'users', 
                (qb) => qb.where('users.status = :status', { status: "Decline" })
            )

		// filter
        if (cleanConditions.user_id) {
			query = query.andWhere(`institutions.user_id = :user_id`, { user_id: cleanConditions.user_id })
		}
		if (cleanConditions.name) {
			query = query.andWhere(`institutions.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.type) {
			query = query.andWhere(`institutions.type = :type`, { type: cleanConditions.type })
		}
        if (cleanConditions.code) {
			query = query.andWhere(`institutions.code LIKE :code`, { code: `%${cleanConditions.code}%` })
		}
        if (cleanConditions.refferal) {
			query = query.andWhere(`institutions.refferal LIKE :refferal`, { refferal: `%${cleanConditions.refferal}%` })
		}
        if (cleanConditions.address) {
			query = query.andWhere(`institutions.address LIKE :address`, { address: `%${cleanConditions.address}%` })
		}
        if (cleanConditions.status) {
			query = query.andWhere(`institutions.status = :status`, { status: cleanConditions.status })
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

        const types = await this.institutionRepository
        .createQueryBuilder('institutions')
        .select('DISTINCT institutions.type')
        .getRawMany()

        const users = await this.userRepository.find()
		return { datas:datas[0], paginate_data, types, users }
	}

    public async create() {
        const users = await this.userRepository.find()
        return { users }
    }

    public async store(request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const data = transactionalEntityManager.create(Institution, { ...request })
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

    public async edit(id: string) {
        const data = await this.institutionRepository.findOne({ where: { id } })
        const users = await this.userRepository.find()
        return { data, users }
    }

    public async update(id: string, request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const find = await transactionalEntityManager.findOne(Institution, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const data = transactionalEntityManager.merge(Institution, find, { ...request })
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
                const find = await transactionalEntityManager.findOne(Institution, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const result = transactionalEntityManager.remove(Institution, find)
                if (!result) {
                    throw new Error("Delete Fail")
                }
                return result
            } catch (error: any) {
                throw error
            }
        })
    }

    public async generate_refferal() {
        let uniqueCode: string = '';
        let isUnique = false;
        while (!isUnique) {
            const length: number = 6
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            uniqueCode = ''
            for (let i = 0; i < length; i++) {
                uniqueCode += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            const repository = await this.institutionRepository.count({ where: { refferal: uniqueCode } })
            isUnique = repository === 0
        }
        return uniqueCode
    }

    public async index_promotion(institution_id: string, filter: any) {
        const cleanConditions = removePrefix(filter,'q_')
        let query = this.promotionRepository.createQueryBuilder('promotions')
		query = query.leftJoinAndSelect('promotions.institutions','institutions')
		query = query.andWhere(`institutions.id = '${institution_id}'`)

        // filter
		if (cleanConditions.code) {
			query.andWhere(`promotions.code LIKE :code`, { code: `%${cleanConditions.code}%` })
		}
        if (cleanConditions.desc) {
			query.andWhere(`promotions.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
        if (cleanConditions.discount_percent_status) {
			query.andWhere(`promotions.discount_percent_status = :discount_percent_status`, { discount_percent_status: cleanConditions.discount_percent_status })
		}
        if (cleanConditions.discount_percent_operator && cleanConditions.discount_percent) {
			query.andWhere(`promotions.discount_percent :discount_percent_operator :discount_percent`, { discount_percent_operator: cleanConditions.discount_percent_operator, discount_percent: cleanConditions.discount_percent })
		}
        if (cleanConditions.discount_amount_status) {
			query.andWhere(`promotions.discount_amount_status = :discount_amount_status`, { discount_amount_status: cleanConditions.discount_amount_status })
		}
        if (cleanConditions.discount_amount_operator && cleanConditions.discount_amount) {
			query.andWhere(`promotions.discount_amount :discount_amount_operator :discount_amount`, { discount_amount_operator: cleanConditions.discount_amount_operator, discount_amount: cleanConditions.discount_amount })
		}
        if (cleanConditions.period_start_start && cleanConditions.period_start_end) {
			query.andWhere(`promotions.period_start BETWEEN :period_start_start AND :period_start_end`, { period_start_start: cleanConditions.period_start_start, period_start_end: cleanConditions.period_start_end })
		}
        if (cleanConditions.period_end_start && cleanConditions.period_end_end) {
			query.andWhere(`promotions.period_end BETWEEN :period_end_start AND :period_end_end`, { period_end_start: cleanConditions.period_end_start, period_end_end: cleanConditions.period_end_end })
		}
        if (cleanConditions.number_operator && cleanConditions.number) {
			query.andWhere(`promotions.number :number_operator :number`, { number_operator: cleanConditions.number_operator, number: cleanConditions.number })
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
        return { datas: datas[0], paginate_data }
    }
}