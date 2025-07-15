import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateClassesSubjectsTable1722473345058 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "classes_subjects",
                columns: [
                    {
                        name: "class_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "subject_id",
                        type: "varchar",
                        length: "36",
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("classes_subjects")
    }

}
