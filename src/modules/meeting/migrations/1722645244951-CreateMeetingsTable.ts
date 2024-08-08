import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMeetingsTable1722645244951 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "meetings",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "room_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "class_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "mentor_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "meeting_number",
                    type: "int",
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
            ],
            indices: [
                {
                    name: "meetings__id",
                    columnNames: ["id"]
                },
                {
                    name: "meetings__room_id",
                    columnNames: ["room_id"]
                },
                {
                    name: "meetings__class_id",
                    columnNames: ["class_id"]
                },
                {
                    name: "meetings__mentor_id",
                    columnNames: ["mentor_id"]
                },
                {
                    name: "meetings__meeting_number",
                    columnNames: ["meeting_number"]
                },
                {
                    name: "meetings__date_start",
                    columnNames: ["date_start"]
                },
                {
                    name: "meetings__date_end",
                    columnNames: ["date_end"]
                },
                {
                    name: "meetings__status",
                    columnNames: ["status"]
                },
                {
                    name: "meetings__desc",
                    columnNames: ["desc"]
                },
            ]
        }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("meetings",true)
    }

}
