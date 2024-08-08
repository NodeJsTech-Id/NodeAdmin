import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateProfessionsTable1722077820190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "professions",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["Active", "Inactive"]
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
                        name: "professions__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "professions__name",
                        columnNames: ["name"]
                    },
                    {
                        name: "professions__desc",
                        columnNames: ["desc"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("professions")
    }

}
