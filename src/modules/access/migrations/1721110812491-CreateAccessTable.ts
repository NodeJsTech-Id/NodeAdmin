import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAccessTable1721110812491 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "accesses",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "url",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "method",
                        type: "varchar",
                        length: "255",
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
            }),
            true,
        )

        await queryRunner.createIndex(
            "accesses",
            new TableIndex({
                name: "accesses__id",
                columnNames: ["id"],
            }),
        )
        await queryRunner.createIndex(
            "accesses",
            new TableIndex({
                name: "accesses__url",
                columnNames: ["url"],
            }),
        )
        await queryRunner.createIndex(
            "accesses",
            new TableIndex({
                name: "accesses__method",
                columnNames: ["method"],
            }),
        )
        await queryRunner.createIndex(
            "accesses",
            new TableIndex({
                name: "accesses__status",
                columnNames: ["status"],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("accesses")
    }

}
