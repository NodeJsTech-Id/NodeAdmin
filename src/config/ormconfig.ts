import { DataSource, DataSourceOptions } from 'typeorm';
import path from 'path';
import env from './env';
import { Permission } from '../modules/access/models/permission.entity';
import { Role } from '../modules/access/models/role.entity';
import { User } from '../modules/access/models/user.entity';
import { Setting } from '../modules/setting/models/setting.entity';

// Dialect dibaca apa adanya dari env — TypeORM mendukung mysql | mariadb |
// postgres | cockroachdb | sqlite | better-sqlite3 | mssql | oracle | dll.
const dbType = env.db.type as DataSourceOptions['type'];

const isSqlite = dbType === 'sqlite' || dbType === 'better-sqlite3';
const isMysqlFamily = dbType === 'mysql' || dbType === 'mariadb';

const baseOptions = {
    entities: [
        Permission, Role, User, Setting
    ],
    migrations: [
        path.resolve(__dirname, '../modules/**/migrations/*.ts')
    ],
    synchronize: env.db.synchronize,
    logging: env.db.logging,
};

const connectionOptions = isSqlite
    ? {
        database: env.db.database,
    }
    : {
        host: env.db.host,
        port: env.db.port,
        username: env.db.username,
        password: env.db.password,
        database: env.db.database,
        // Ensure driver treats datetimes as UTC (mysql/mariadb only)
        ...(isMysqlFamily ? { timezone: 'Z' } : {}),
        // Connection pool — hindari pool jenuh saat concurrency tinggi
        extra: { connectionLimit: env.db.connectionLimit },
    };

const AppDataSource = new DataSource({
    type: dbType,
    ...connectionOptions,
    ...baseOptions,
} as DataSourceOptions);

export default AppDataSource;
