import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSettingTable1721122178244 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "settings",
            columns: [
                {
                    name: "id",
                    type: "char",
                    length: "36",
                    isPrimary: true,
                    isNullable: false,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "initial",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "description",
                    type: "longtext",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "icon",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "logo",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "login_image",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "phone",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "address",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "copyright",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "created_by",
                    type: "char",
                    length: "36",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "updated_by",
                    type: "char",
                    length: "36",
                    isNullable: true,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    isNullable: true
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP",
                    isNullable: true
                }
            ],
            indices: [
                {
                    name: "settings__id",
                    columnNames: ["id"]
                },
                {
                    name: "settings__initial",
                    columnNames: ["initial"]
                },
                {
                    name: "settings__name",
                    columnNames: ["name"]
                },
                {
                    name: "settings__icon",
                    columnNames: ["icon"]
                },
                {
                    name: "settings__logo",
                    columnNames: ["logo"]
                },
                {
                    name: "settings__login_image",
                    columnNames: ["login_image"]
                },
                {
                    name: "settings__phone",
                    columnNames: ["phone"]
                },
                {
                    name: "settings__setting_email",
                    columnNames: ["email"]
                },
                {
                    name: "settings__copyright",
                    columnNames: ["copyright"]
                },
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("settings");
    }

}