import { MigrationInterface, QueryRunner } from "typeorm"
import { v6 as uuidv6 } from 'uuid'
import { Setting } from "../models/setting.entity"

export class InitSetting1721122336080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO settings (id, initial, name, description, icon, logo, login_image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
            uuidv6(),
            "Node Admin",
            "Node Admin",
            "Node Admin",
            "modules/setting/laravel.png",
            "modules/setting/laravel.png",
            "modules/setting/laravel.png"
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
