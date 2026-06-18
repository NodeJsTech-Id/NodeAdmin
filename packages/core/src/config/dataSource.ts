import { DataSource, DataSourceOptions, MixedList, EntitySchema } from 'typeorm'

/**
 * Factory DataSource generik — app turunan menyuntik entity, path migration,
 * dan kredensial DB; core menangani percabangan dialect (sqlite vs mysql-family
 * vs lainnya), timezone UTC mysql/mariadb, dan connection pool.
 */
export interface DataSourceConfig {
    type: DataSourceOptions['type']
    host?: string
    port?: number
    username?: string
    password?: string
    database?: string
    synchronize?: boolean
    logging?: boolean
    connectionLimit?: number
    entities: MixedList<Function | string | EntitySchema>
    migrations: MixedList<Function | string>
}

export function createDataSource(config: DataSourceConfig): DataSource {
    const dbType = config.type
    const isSqlite = dbType === 'sqlite' || dbType === 'better-sqlite3'
    const isMysqlFamily = dbType === 'mysql' || dbType === 'mariadb'

    const baseOptions = {
        entities: config.entities,
        migrations: config.migrations,
        synchronize: config.synchronize ?? false,
        logging: config.logging ?? false,
    }

    const connectionOptions = isSqlite
        ? { database: config.database }
        : {
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            // Driver memperlakukan datetime sebagai UTC (mysql/mariadb saja)
            ...(isMysqlFamily ? { timezone: 'Z' } : {}),
            // Connection pool — hindari pool jenuh saat concurrency tinggi
            extra: { connectionLimit: config.connectionLimit ?? 10 },
        }

    return new DataSource({
        type: dbType,
        ...connectionOptions,
        ...baseOptions,
    } as DataSourceOptions)
}
