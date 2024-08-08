import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateClassesMentorsTable1722789450083 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "classes_mentors",
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
        await queryRunner.dropTable("classes_mentors")
    }

}
