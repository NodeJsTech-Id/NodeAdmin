import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateMeetingDetailPresencesTable1722765865376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table(
            {
                name: "meeting_detail_presences",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "meeting_detail_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "user_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "15",
                    },
                    {
                        name: "desc",
                        type: "varchar",
                        length: "15",
                        isNullable: true,
                    }
                ],
                indices: [
                    {
                        name: "meeting_detail_presences__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "meeting_detail_presences__meeting_detail_id",
                        columnNames: ["meeting_detail_id"]
                    },
                    {
                        name: "meeting_detail_presences__user_id",
                        columnNames: ["user_id"],
                    },
                    {
                        name: "meeting_detail_presences__status",
                        columnNames: ["status"],
                    },
                ]
            }
        ),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("meeting_detail_presences",true)
    }

}
