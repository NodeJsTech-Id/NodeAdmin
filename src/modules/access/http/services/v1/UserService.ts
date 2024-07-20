import { In } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Role } from '../../../models/role.entity'
import { User } from '../../../models/user.entity'
import bcrypt from 'bcryptjs'
import functions, { removePrefix } from '../../../../../helpers/functions'
import fileService from '../../../../../services/fileService'
import { v6 as uuidv6 } from 'uuid'
import Module from '../../../Module'

export default class UserService {
  private userRepository = AppDataSource.getRepository(User)
  private roleRepository = AppDataSource.getRepository(Role)

  public async index(filter: any) {
    const cleanConditions = removePrefix(filter, 'q_')
    let query = this.userRepository.createQueryBuilder('users')

    // relations
    query = query.leftJoinAndSelect('users.roles','roles')

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
    if (cleanConditions.status) {
      query = query.andWhere(`users.status = :status`, { status: cleanConditions.status })
    }
    if (cleanConditions.role) {
      query = query.andWhere(`roles.id = :roles_id`, { roles_id: cleanConditions.role })
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
    const roles = await this.roleRepository.find()
		return { datas:datas[0], roles, paginate_data }
  }

  public async create() {
    const roles = await this.roleRepository.find()
    return roles
  }

  public async store(request: any, files: any = null, forRegister: boolean = false) {
    try {
      request.id = uuidv6()
      let roles;
      if (forRegister) {
        roles = await this.roleRepository.findBy({ name: "User" })
      } else {
        roles = await this.roleRepository.findBy({ id: In(request.roles) })
        if (!roles.length) {
          throw new Error("Roles Not Found")
        }
      }
      if (files) {
        const fileName = request.id
        const uploadResults = await Promise.all(
          files.map((file: { originalname: any; buffer: any }) => {
            const path = Module.filePath+"user/"+fileName+"."+file.originalname.split('.').pop().toLowerCase()
            fileService.uploadFile(path, file.buffer)
            request.picture = path
          })
        );
      }
      request = functions.removeEmptyFields(request)
			request.password = await bcrypt.hash(request.password, 10)
      const user = this.userRepository.create({ ...request, roles })
      const result = await this.userRepository.save(user)
      if (!result) {
        throw new Error("Store User Fail")
      }
      return result
    } catch (error: any) {
      return error
    }
  }

  public async edit(id: string) {
    const roles = await this.roleRepository.find()
    const data = await this.userRepository.findOne({ where: { id }, relations: ['roles'] })
    return { data, roles }
  }

  public async update(id: string, request: any, files: any = null) {
    try {
      const user = await this.userRepository.findOne({ where: { id } })
      if (!user) {
        throw new Error('User not found')
      }
      const roles = await this.roleRepository.findBy({ id: In(request.roles) })
      if (!roles.length) {
        throw new Error("Roles Not Found")
      }
      request = functions.removeEmptyFields(request)
      if (typeof request.password !== 'undefined') {
        request.password = await bcrypt.hash(request.password, 10)
      }
      if (files) {
        const fileName = id
        const uploadResults = await Promise.all(
          files.map((file: { originalname: any; buffer: any }) => {
            const path = Module.filePath+"user/"+fileName+"."+file.originalname.split('.').pop().toLowerCase()
            fileService.uploadFile(path, file.buffer)
            request.picture = path
          })
        );
      }
      const data = this.userRepository.merge(user, { ...request, roles })
      const result = await this.userRepository.save(data)
      if (!result) {
        throw new Error("Update User Fail")
      }
      return result
    } catch (error: any) {
      return error
    }
  }

  public async delete(id: string) {
    const data = await this.userRepository.findOne({ where: { id } })
    if (!data) {
      return false
    }
    await fileService.deleteFile(data.picture)
    const result = await this.userRepository.remove(data)
    if (!result) {
      return false
    }
    return result
  }
}