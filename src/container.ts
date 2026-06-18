import 'reflect-metadata'
import { container } from 'tsyringe'
import AppDataSource from './config/ormconfig'
import { User } from './modules/access/models/user.entity'
import { Role } from './modules/access/models/role.entity'
import { Permission } from './modules/access/models/permission.entity'
import { Setting } from './modules/setting/models/setting.entity'
import { TOKENS } from './tokens'

/**
 * Repository didaftarkan sebagai factory LAZY — getRepository hanya valid
 * setelah AppDataSource.initialize(), dan factory dipanggil saat resolve
 * (per-request via routeBinding), bukan saat module load.
 */

function assertInit() {
    if (!AppDataSource.isInitialized) {
        throw new Error('[container] AppDataSource belum di-initialize saat resolve repository')
    }
}

container.register(TOKENS.UserRepository, { useFactory: () => { assertInit(); return AppDataSource.getRepository(User) } })
container.register(TOKENS.RoleRepository, { useFactory: () => { assertInit(); return AppDataSource.getRepository(Role) } })
container.register(TOKENS.PermissionRepository, { useFactory: () => { assertInit(); return AppDataSource.getRepository(Permission) } })
container.register(TOKENS.SettingRepository, { useFactory: () => { assertInit(); return AppDataSource.getRepository(Setting) } })

// --- Service registrations (per-modul) ---
import UserService from './modules/access/http/services/v1/UserService'
import RoleService from './modules/access/http/services/v1/RoleService'
import PermissionService from './modules/access/http/services/v1/PermissionService'
import SettingService from './modules/setting/http/services/v1/SettingService'
container.register(TOKENS.IUserService, { useClass: UserService })
container.register(TOKENS.IRoleService, { useClass: RoleService })
container.register(TOKENS.IPermissionService, { useClass: PermissionService })
container.register(TOKENS.ISettingService, { useClass: SettingService })

export { container, TOKENS }
