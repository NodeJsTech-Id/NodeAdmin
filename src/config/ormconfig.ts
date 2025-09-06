import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';
import { Permission } from '../modules/access/models/permission.entity';
import { Role } from '../modules/access/models/role.entity';
import { User } from '../modules/access/models/user.entity';
import { Setting } from '../modules/setting/models/setting.entity';

dotenv.config();

const AppDataSource = new DataSource({
    type: process.env.DB_TYPE as 'mysql' || 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [
        Permission, Role, User, Setting
    ],
    migrations: [
        path.resolve(__dirname, '../modules/**/migrations/*.ts')
    ],
    synchronize: false,
    logging: process.env.DB_LOGGING as unknown as boolean,
});

export default AppDataSource;
