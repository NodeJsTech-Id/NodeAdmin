import { container, InjectionToken } from 'tsyringe'
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm'

/**
 * Helper registrasi DI generik untuk repository TypeORM.
 *
 * Repository didaftarkan sebagai factory LAZY — `getRepository` hanya valid
 * setelah `dataSource.initialize()`, dan factory dipanggil saat resolve
 * (per-request via routeBinding), bukan saat module load.
 */

/** Pastikan DataSource sudah di-initialize sebelum repository di-resolve. */
export function assertInit(dataSource: DataSource) {
    if (!dataSource.isInitialized) {
        throw new Error('[container] DataSource belum di-initialize saat resolve repository')
    }
}

/**
 * Daftarkan repository sebuah entity ke token DI sebagai factory lazy.
 * App: `registerRepository(AppDataSource, TOKENS.UserRepository, User)`.
 */
export function registerRepository<T extends ObjectLiteral>(
    dataSource: DataSource,
    token: InjectionToken,
    entity: EntityTarget<T>,
) {
    container.register(token, {
        useFactory: () => {
            assertInit(dataSource)
            return dataSource.getRepository(entity)
        },
    })
}
