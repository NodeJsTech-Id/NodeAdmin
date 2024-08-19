import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailSettingToSettingsTable1723948121171 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_from_address",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_from_name",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_mailer",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_host",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_port",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_username",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
        await queryRunner.addColumn(
            "settings",
            new TableColumn({
                name: "mail_password",
                type: "varchar",
                length: "100",
                isNullable: true,
                default: null,
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(
            "settings",
            "mail_from_address"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_from_name"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_mailer"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_host"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_port"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_username"
        )
        await queryRunner.dropColumn(
            "settings",
            "mail_password"
        )
    }

}
