import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSubjectFilesTable1752508029277 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "subject_files",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "subject_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "path",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: 'CURRENT_TIMESTAMP'
                    },
                ],
                indices: [
                    {
                        name: "subject_files__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "subject_files__subject_id",
                        columnNames: ["subject_id"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subject_files")
    }

}
