import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateMeetingSchedulesTable1722646679500 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: "meetings_schedules",
                columns: [
                    {
                        name: "meeting_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "schedule_id",
                        type: "varchar",
                        length: "36",
                    }
                ],
            }
        ),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("meetings_schedules",true)
    }

}
