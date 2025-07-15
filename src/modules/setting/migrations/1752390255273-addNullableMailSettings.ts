import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddNullableMailSettings1752390255273 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "settings",
            "mail_from_address",
            new TableColumn({
                name: "mail_from_address",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_from_name",
            new TableColumn({
                name: "mail_from_name",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_mailer",
            new TableColumn({
                name: "mail_mailer",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_host",
            new TableColumn({
                name: "mail_host",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_port",
            new TableColumn({
                name: "mail_port",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_username",
            new TableColumn({
                name: "mail_username",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
        await queryRunner.changeColumn(
            "settings",
            "mail_password",
            new TableColumn({
                name: "mail_password",
                type: "varchar",
                length: "100",
                isNullable: true
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
