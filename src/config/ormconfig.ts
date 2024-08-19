import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import path from 'path'
import { Access } from '../modules/access/models/access.entity'
import { Role } from '../modules/access/models/role.entity'
import { User } from '../modules/access/models/user.entity'
import { Setting } from '../modules/setting/models/setting.entity'
import { Category } from '../modules/category/models/category.entity'
import { Subject } from '../modules/subject/models/subject.entity'
import { SubjectSub } from '../modules/subject/models/subject_sub.entity'
import { SubjectSubDetail } from '../modules/subject/models/subject_sub_detail.entity'
import { Class } from '../modules/class/models/class.entity'
import { Schedule } from '../modules/schedule/models/schedule.entity'
import { Room } from '../modules/room/models/room.entity'
import { Meeting } from '../modules/meeting/models/meeting.entity'
import { MeetingDetail } from '../modules/meeting/models/meeting_detail.entity'
import { MeetingDetailPresence } from '../modules/meeting/models/meeting_detail_presence.entity'
import { Profession } from '../modules/profession/models/profession.entity'
import { UserProfile } from '../modules/access/models/user_profile.entity'
import { Institution } from '../modules/institution/models/institution.entity'
import { InstitutionUser } from '../modules/institution/models/institution_user.entity'
import { Promotion } from '../modules/promotion/models/v1/promotion.entity'
import { News } from '../modules/news/models/news.entity'
import { NewsCategory } from '../modules/news/models/news_category.entity'
import { HomepageMenu } from '../modules/homepage/models/homepage_menu.entity'

dotenv.config()
// console.log("Buka");
console.log(process.env.KELASCENDIKIA_DATABASE_URL);
// console.log("Tutup");

const AppDataSource = new DataSource({
    // type: process.env.DB_TYPE as 'mysql' || 'mysql',
    type: 'mysql',
    // host: process.env.DB_HOST,
    // port: parseInt(process.env.DB_PORT as string, 10),
    // username: process.env.DB_USERNAME,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_DATABASE,
    url: process.env.KELASCENDIKIA_DATABASE_URL,
    entities: [
        Access,
        Role,
        User,
        Setting,
        Category,
        Subject,
        SubjectSub,
        SubjectSubDetail,
        Class,
        Schedule,
        Room,
        Meeting,
        MeetingDetail,
        MeetingDetailPresence,
        Profession,
        UserProfile,
        Institution,
        InstitutionUser,
        Promotion,
        News,
        NewsCategory,
        HomepageMenu,
    ],
    migrations: [
        path.resolve(__dirname, '../modules/**/migrations/*.ts')
    ],
    synchronize: false,
    // logging: process.env.DB_LOGGING as unknown as boolean,
    logging: false,
})

export default AppDataSource
