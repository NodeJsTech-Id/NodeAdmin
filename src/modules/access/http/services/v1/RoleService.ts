import { Not } from 'typeorm'
import { AppDataSource } from '../../../../../index'
import { Role } from '../../../models/role.entity'
import { Permission } from '../../../models/permission.entity'
import functions, { removePrefix } from '../../../../../helpers/functions'

export default class RoleService {
	private roleRepository = AppDataSource.getRepository(Role)
    private permissionRepository = AppDataSource.getRepository(Permission)

	public async index(filter: any) {
		const cleanConditions = removePrefix(filter, 'q_')
		let query = this.roleRepository.createQueryBuilder('roles')

		// filter
		if (cleanConditions.name) {
			query = query.andWhere(`roles.name LIKE :name`, { name: `%${cleanConditions.name}%` })
		}
		if (cleanConditions.desc) {
			query = query.andWhere(`roles.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
		}
		if (cleanConditions.status) {
			query = query.andWhere(`roles.status = :status`, { status: cleanConditions.status })
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
			const find = await this.roleRepository.findOne({ where: { name: request.name } })
			if (find) {
				throw new Error("Role Already Exists")
			}
			request = functions.removeEmptyFields(request)
			const data = this.roleRepository.create({ ...request })
			const result = await this.roleRepository.save(data)
			if (!result) {
				throw new Error("Store Role Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async edit(id: string) {
		const data = await this.roleRepository.findOne({ where: { id } })
		return data
	}

	public async update(id: string, request: any) {
		try {
			const find = await this.roleRepository.findOne({ where: { id: Not(id), name: request.name } })
			if (find) {
				throw new Error("Role Already Exists")
			}
			const role = await this.roleRepository.findOne({ where: { id } })
			if (!role) {
				throw new Error('Role not found')
			}
			request = functions.removeEmptyFields(request)
			const data = this.roleRepository.merge(role, { ...request })
			const result = await this.roleRepository.save(data)
			if (!result) {
				throw new Error("Update Role Fail")
			}
			return result
		} catch (error: any) {
			return error
		}
	}

	public async delete(id: string) {
		const data = await this.roleRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.roleRepository.remove(data)
		if (!result) {
			return false
		}
		return result
	}

	public async permission(role_id: string,filter:any) {
		const cleanConditions = removePrefix(filter, 'q_')
        const role = await this.roleRepository.findOne({ where: { id: role_id }, relations: ['permissions'] })
        let query = this.permissionRepository.createQueryBuilder('permissions')

		// filter
		if (cleanConditions.url) {
            query = query.andWhere(`permissions.url LIKE :url`, { url: `%${cleanConditions.url}%` })
		}
		if (cleanConditions.method) {
            query = query.andWhere(`permissions.method = :method`, { method: cleanConditions.method })
		}
		if (cleanConditions.status) {
            if (cleanConditions.status == 'Active') {
                query = query.leftJoinAndSelect('permissions.roles', 'role')
                        .andWhere('role.id = :role_id', { role_id })
            } else if (cleanConditions.status == 'Inactive') {
                query = query.leftJoinAndSelect('permissions.roles', 'role')
                .where(qb => {
                    const subQuery = qb.subQuery()
                        .select('roles_permissions.permission_id')
                        .from('roles_permissions', 'roles_permissions')
                        .where('roles_permissions.role_id = :roleId')
                        .getQuery()
                    return `permissions.id NOT IN ${subQuery}`
                })
                .setParameter('roleId', role_id)
            }
        }
        if (cleanConditions.desc) {
            query = query.andWhere(`permissions.desc LIKE :desc`, { desc: `%${cleanConditions.desc}%` })
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
		return { datas:datas[0], role, paginate_data }
	}

	public async permission_assign(role_id: string, permission_id: string) {
		try {
        const role = await this.roleRepository.findOne({
            where: { id: role_id },
            relations: ['permissions']
        })
			if (!role) {
				throw new Error('Role not found')
			}
        const permission = await this.permissionRepository.findOne({
            where: { id: permission_id }
        })
			if (!permission) {
				throw new Error('Permission not found')
			}
        role.permissions.push(permission as any)
			const result = await this.roleRepository.save(role)
			if (!result) {
				throw new Error("Assign Permission Fail")
			}
			return result
		} catch (error) {
			return error
		}
	}

	public async permission_assign_selected(role_id: string, permissions: string[]) {
		try {
        const role = await this.roleRepository.findOne({
            where: { id: role_id },
            relations: ['permissions']
        })
			if (!role) {
				throw new Error('Role not found')
			}
			permissions.forEach(async (permission_id: string) => {
            const permission = await this.permissionRepository.findOne({
                where: { id: permission_id }
            })
				if (!permission) {
					throw new Error('Permission not found')
				}
            role.permissions.push(permission as any)
			})
			const result = await this.roleRepository.save(role)
			if (!result) {
				throw new Error("Assign Permission Fail")
			}
			return result
		} catch (error) {
			return error
		}
	}

	public async permission_unassign(role_id: string, permission_id: string) {
		try {
        const role = await this.roleRepository.findOne({
            where: { id: role_id },
            relations: ['permissions']
        })
			if (!role) {
				throw new Error('Role not found')
			}
        role.permissions = role.permissions.filter((permission: { id: string }) => permission.id !== permission_id)
			const result = await this.roleRepository.save(role)
			if (!result) {
				throw new Error("Unassign Permission Fail")
			}
			return result
		} catch (error) {
			return error
		}
	}

	public async permission_unassign_selected(role_id: string, permissions: string[]) {
		try {
        const role = await this.roleRepository.findOne({
            where: { id: role_id },
            relations: ['permissions']
        })
			if (!role) {
				throw new Error('Role not found')
			}
        permissions.forEach(permission_id => {
            role.permissions = role.permissions.filter((permission: { id: string }) => permission.id !== permission_id)
        })
			const result = await this.roleRepository.save(role)
			if (!result) {
				throw new Error("Unassign Permission Fail")
			}
			return result
		} catch (error) {
			return error
		}
	}
}
