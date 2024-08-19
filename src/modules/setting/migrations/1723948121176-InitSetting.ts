import { MigrationInterface, QueryRunner } from "typeorm"
import { v6 as uuidv6 } from 'uuid'
import { Setting } from "../models/setting.entity"

export class InitSetting1723948121176 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.insert(Setting, {
            id: uuidv6(),
            initial: "Node Admin",
            name: "Node Admin",
            description: "Node Admin",
            icon: "modules/setting/laravel.png",
            logo: "modules/setting/laravel.png",
            login_image: "modules/setting/laravel.png",
            mail_from_address: "",
            mail_from_name: "",
            mail_mailer: "",
            mail_host: "",
            mail_port: "",
            mail_username: "",
            mail_password: "",
        })
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
