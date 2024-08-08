import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateRoleAccessTable1721110973824 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "roles_accesses",
                columns: [
                    {
                        name: "role_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "access_id",
                        type: "varchar",
                        length: "36",
                    },
                ],
            }),
            true,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("roles_accesses")
    }

}
