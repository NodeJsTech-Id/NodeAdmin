import AppDataSource from "../../../../../config/ormconfig"
import functions, { removePrefix } from "../../../../../helpers/functions"
import { User } from "../../../../access/models/user.entity"
import { Institution } from "../../../../institution/models/institution.entity"
import { Promotion } from "../../../models/v1/promotion.entity"

export default class PromotionService {
    private promotionRepository = AppDataSource.getRepository(Promotion)
    private institutionRepository = AppDataSource.getRepository(Institution)
    private userRepository = AppDataSource.getRepository(User)

    public async index(filter: any) {
        const cleanConditions = removePrefix(filter,'q_')
        let query = this.promotionRepository.createQueryBuilder('promotions')

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

    public async store(request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const data = transactionalEntityManager.create(Promotion, { ...request })
                const result = await transactionalEntityManager.save(data)
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
        const data = await this.promotionRepository.findOne({ where: { id } })
        return { data }
    }

    public async update(id: string, request: any) {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            try {
                request = functions.removeEmptyFields(request)
                const find = await transactionalEntityManager.findOne(Promotion, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const data = transactionalEntityManager.merge(Promotion, find, { ...request })
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
                const find = await transactionalEntityManager.findOne(Promotion, { where: { id } })
                if (!find) {
                    throw new Error("Not Found")
                }
                const result = transactionalEntityManager.remove(Promotion, find)
                if (!result) {
                    throw new Error("Delete Fail")
                }
                return result
            } catch (error: any) {
                throw error
            }
        })
    }

    public async generate_code() {
        let uniqueCode: string = '';
        let isUnique = false;
        while (!isUnique) {
            const length: number = 6
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            uniqueCode = ''
            for (let i = 0; i < length; i++) {
                uniqueCode += characters.charAt(Math.floor(Math.random() * characters.length))
            }
            const repository = await this.promotionRepository.count({ where: { code: uniqueCode } })
            isUnique = repository === 0
        }
        return uniqueCode
    }

    // promotion institution
	public async index_institution(id: string, filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.institutionRepository.createQueryBuilder('institutions')

		query = query.leftJoinAndSelect('institutions.promotions','promotions')
		query = query.leftJoinAndSelect('institutions.user','user')
		query = query.andWhere(`promotions.id = '${id}'`)

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
        const promotion = await this.promotionRepository.findOne({ where: { id } })
		return { promotion, datas:datas[0], paginate_data, types, users }
	}

	public async create_institution(id: string) {
		const promotion = await this.promotionRepository.findOne({ where: { id } })
		const institutions = await this.institutionRepository.find()
		return {promotion,institutions}
	}

	public async store_institution(id: string, request: any) {
		try {
			const promotion = await this.promotionRepository.findOne({ relations: ['institutions'], where: { id } })
			if (!promotion) {
				throw new Error('Promotion not found')
			}
			const institution = await this.institutionRepository.findOneBy({ id: request.institution_id })
			if (!institution) {
				throw new Error("Institution Not Found")
			}
			promotion.institutions.push(institution);
			const data = this.promotionRepository.merge(promotion)
			const result = await this.promotionRepository.save(data)
			if (!result) {
				throw new Error("Add Institution Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete_institution(id: string, institution_id: string) {
		try {
			const promotion = await this.promotionRepository.findOne({ relations: ['institutions'], where: { id } })
			if (!promotion) {
				throw new Error('Promotion not found')
			}
			promotion.institutions = promotion.institutions.filter((institution: { id: string }) => institution.id !== institution_id)
			const result = await this.promotionRepository.save(promotion)
			if (!result) {
				throw new Error("Remove User Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}
	// end promotion institution
}