import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ChangeMentorIdToMeetingsTable1724087391432 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("meetings", "mentor_id", new TableColumn({
            name: "mentor_id",
            type: "varchar",
            length: "36",
            isNullable: true,
            default: null,
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
