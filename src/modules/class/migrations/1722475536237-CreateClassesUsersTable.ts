import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateClassesUsersTable1722475536237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "classes_users",
                columns: [
                    {
                        name: "class_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "user_id",
                        type: "varchar",
                        length: "36",
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("classes_users")
    }

}
