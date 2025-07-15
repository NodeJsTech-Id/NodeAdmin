import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateUserProfilesTable1722947280484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "user_profiles",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "user_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "profession_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "biography",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "address",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "office_name",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "office_address",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                },
                {
                    name: "created_by",
                    type: "varchar",
                    length: "36",
                    isNullable: true,
                },
                {
                    name: "updated_by",
                    type: "varchar",
                    length: "36",
                    isNullable: true,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: 'CURRENT_TIMESTAMP'
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: 'CURRENT_TIMESTAMP'
                },
            ],
            indices: [
                {
                    name: "user_profiles__id",
                    columnNames: ["id"]
                },
                {
                    name: "user_profiles__user_id",
                    columnNames: ["user_id"]
                },
                {
                    name: "user_profiles__profession_id",
                    columnNames: ["profession_id"]
                },
                {
                    name: "user_profiles__biography",
                    columnNames: ["biography"]
                },
                {
                    name: "user_profiles__address",
                    columnNames: ["address"]
                },
                {
                    name: "user_profiles__office_name",
                    columnNames: ["office_name"]
                },
                {
                    name: "user_profiles__office_address",
                    columnNames: ["office_address"]
                },
            ]
        }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user_profiles",true)
    }

}
