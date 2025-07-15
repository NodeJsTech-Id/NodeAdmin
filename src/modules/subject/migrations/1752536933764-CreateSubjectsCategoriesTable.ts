import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSubjectsCategoriesTable1752536933764 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("subjects", "category_id")
        await queryRunner.createTable(
            new Table({
                name: "subjects_categories",
                columns: [
                    {
                        name: "subject_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "category_id",
                        type: "varchar",
                        length: "36",
                    },
                ],
            }),
            true,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subjects_categories")
    }

}
