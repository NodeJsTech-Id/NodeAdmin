import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInstitutionUsersTable1723036302653 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "institution_users",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "institution_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "user_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "status",
                    type: "varchar",
                    length: "50",
                },
            ],
            indices: [
                {
                    name: "institution_users__id",
                    columnNames: ["id"],
                },
                {
                    name: "institution_users__institution_id",
                    columnNames: ["institution_id"],
                },
                {
                    name: "institution_users__user_id",
                    columnNames: ["user_id"],
                },
                {
                    name: "institution_users__status",
                    columnNames: ["status"],
                },
            ]
        }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("institution_users",true)
    }

}
