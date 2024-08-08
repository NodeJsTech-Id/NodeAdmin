import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSubjectsTable1722077820190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "subjects",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "category_id",
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
                        name: "subjects__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "subjects__category_id",
                        columnNames: ["category_id"]
                    },
                    {
                        name: "subjects__name",
                        columnNames: ["name"]
                    },
                    {
                        name: "subjects__desc",
                        columnNames: ["desc"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("subjects")
    }

}
