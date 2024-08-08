import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateRoomsTable1722077820190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "rooms",
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
                        name: "rooms__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "rooms__name",
                        columnNames: ["name"]
                    },
                    {
                        name: "rooms__desc",
                        columnNames: ["desc"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("rooms")
    }

}
