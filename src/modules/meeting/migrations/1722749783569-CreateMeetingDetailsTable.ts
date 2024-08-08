import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMeetingDetailsTable1722749783569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "meeting_details",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "meeting_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "date_start",
                    type: "date",
                },
                {
                    name: "date_end",
                    type: "date",
                },
                {
                    name: "time_start",
                    type: "time",
                },
                {
                    name: "time_end",
                    type: "time",
                },
                {
                    name: "meeting_code",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "duration",
                    type: "tinyint",
                },
                {
                    name: "credential",
                    type: "json",
                    isNullable: true,
                },
                {
                    name: "status",
                    type: "varchar",
                    length: "20"
                },
                {
                    name: "desc",
                    type: "varchar",
                    length: "255",
                    isNullable: true,
                }
            ],
            indices: [
                {
                    name: "meeting_details__id",
                    columnNames: ["id"]
                },
                {
                    name: "meeting_details__meeting_id",
                    columnNames: ["meeting_id"]
                },
                {
                    name: "meeting_details__date_start",
                    columnNames: ["date_start"]
                },
                {
                    name: "meeting_details__date_end",
                    columnNames: ["date_end"]
                },
                {
                    name: "meeting_details__time_start",
                    columnNames: ["time_start"]
                },
                {
                    name: "meeting_details__time_end",
                    columnNames: ["time_end"]
                },
                {
                    name: "meeting_details__meeting_code",
                    columnNames: ["meeting_code"]
                },
            ]
        }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("meeting_details", true)
    }

}
