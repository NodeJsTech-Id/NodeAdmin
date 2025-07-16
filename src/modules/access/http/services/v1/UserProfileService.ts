import { AppDataSource } from '../../../../../index'
import functions from '../../../../../helpers/functions'
import { UserProfile } from '../../../models/user_profile.entity'
import { User } from '../../../models/user.entity'
import { Profession } from '../../../../profession/models/profession.entity'
import { StatusEnum } from '../../../../../enums/StatusEnum'

export default class UserProfileService {
	private userProfileRepository = AppDataSource.getRepository(UserProfile)
	private userRepository = AppDataSource.getRepository(User)
	private professionRepository = AppDataSource.getRepository(Profession)

	public async index(user_id: string) {
		const data = await this.userProfileRepository.findOne({ where: { user_id } })
		const user = await this.userRepository.findOne({ where: { id: user_id } })
		const professions = await this.professionRepository.find({ where: { status: StatusEnum.ACTIVE } })
		return { data, user, professions }
	}

	public async update(user_id: string, request: any) {
		try {
			const find = await this.userProfileRepository.findOne({ where: { user_id } })
			if (!find) {
				request = functions.removeEmptyFields(request)
				const data = this.userProfileRepository.create({ ...request, user_id })
				const result = await this.userProfileRepository.save(data)
				if (!result) {
					throw new Error("Update User Profile Fail")
				}
				return result
			} else {
				request = functions.removeEmptyFields(request)
				const data = this.userProfileRepository.merge(find, { ...request })
				const result = await this.userProfileRepository.save(data)
				if (!result) {
					throw new Error("Update User Profile Fail")
				}
				return result
			}
		} catch (error: any) {
			return error
		}
	}
}