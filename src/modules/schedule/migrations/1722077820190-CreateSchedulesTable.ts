import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateSchedulesTable1722077820190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "schedules",
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
                        name: "day",
                        type: "varchar",
                        length: "20",
                    },
                    {
                        name: "start",
                        type: "time",
                    },
                    {
                        name: "end",
                        type: "time",
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
                        name: "schedules__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "schedules__name",
                        columnNames: ["name"]
                    },
                    {
                        name: "schedules__day",
                        columnNames: ["day"]
                    },
                    {
                        name: "schedules__start",
                        columnNames: ["start"]
                    },
                    {
                        name: "schedules__end",
                        columnNames: ["end"]
                    },
                    {
                        name: "schedules__desc",
                        columnNames: ["desc"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("schedules")
    }

}
