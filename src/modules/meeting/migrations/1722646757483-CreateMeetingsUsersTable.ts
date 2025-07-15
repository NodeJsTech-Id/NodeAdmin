import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateMeetingsUsersTable1722646757483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: "meetings_users",
                columns: [
                    {
                        name: "meeting_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "user_id",
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
        await queryRunner.dropTable("meetings_users",true)
    }

}
