import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSubjectSubDetailContentsTable1724146312238 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "subject_sub_detail_contents",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "subject_sub_detail_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "content",
                        type: "text",
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
                        name: "subject_sub_detail_contents__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "subject_sub_detail_contents__subject_sub_detail_id",
                        columnNames: ["subject_sub_detail_id"]
                    },
                    {
                        name: "subject_sub_detail_contents__name",
                        columnNames: ["name"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subject_sub_detail_contents")
    }

}
