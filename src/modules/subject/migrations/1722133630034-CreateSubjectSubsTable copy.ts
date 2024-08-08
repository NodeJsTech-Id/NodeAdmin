import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSubjectSubsTable1722133630034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "subject_subs",
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
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "desc",
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
                        name: "subject_subs__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "subject_subs__subject_id",
                        columnNames: ["subject_id"]
                    },
                    {
                        name: "subject_subs__name",
                        columnNames: ["name"]
                    },
                    {
                        name: "subject_subs__desc",
                        columnNames: ["desc"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subject_subs")
    }

}
