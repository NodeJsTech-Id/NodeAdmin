import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddSubjectSubIdToSubjectSubContentTable1752671028764 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "subject_sub_contents",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "subject_sub_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "order_number",
                        type: "tinyint"
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
                        name: "subject_sub_contents__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "subject_sub_contents__subject_sub_id",
                        columnNames: ["subject_sub_id"]
                    },
                    {
                        name: "subject_sub_contents__name",
                        columnNames: ["name"]
                    },
                ]
            }),
            true
        )
        await queryRunner.dropTable("subject_sub_detail_contents")
        await queryRunner.dropTable("subject_sub_details")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subject_sub_contents")
    }

}
