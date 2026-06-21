import 'reflect-metadata'
import { container } from 'tsyringe'
import { registerRepository } from '@flazhost-nodeadmin/core'
import AppDataSource from './config/ormconfig'
import { User } from './modules/access/models/user.entity'
import { Role } from './modules/access/models/role.entity'
import { Permission } from './modules/access/models/permission.entity'
import { Setting } from './modules/setting/models/setting.entity'
import { TOKENS } from './tokens'

/**
 * Repository didaftarkan sebagai factory LAZY (via core registerRepository) —
 * getRepository hanya valid setelah AppDataSource.initialize(), dan factory
 * dipanggil saat resolve (per-request via routeBinding), bukan saat module load.
 */

registerRepository(AppDataSource, TOKENS.UserRepository, User)
registerRepository(AppDataSource, TOKENS.RoleRepository, Role)
registerRepository(AppDataSource, TOKENS.PermissionRepository, Permission)
registerRepository(AppDataSource, TOKENS.SettingRepository, Setting)

// --- Service registrations (per-modul) ---
import UserService from './modules/access/http/services/v1/UserService'
import RoleService from './modules/access/http/services/v1/RoleService'
import PermissionService from './modules/access/http/services/v1/PermissionService'
import SettingService from './modules/setting/http/services/v1/SettingService'
import DashboardService from './modules/dashboard/http/services/v1/DashboardService'
import FeCatalogService from './modules/landing/http/services/v1/FeCatalogService'
container.register(TOKENS.IUserService, { useClass: UserService })
container.register(TOKENS.IRoleService, { useClass: RoleService })
container.register(TOKENS.IPermissionService, { useClass: PermissionService })
container.register(TOKENS.ISettingService, { useClass: SettingService })
container.register(TOKENS.IDashboardService, { useClass: DashboardService })
container.register(TOKENS.IFeCatalogService, { useClass: FeCatalogService })

export { container, TOKENS }
