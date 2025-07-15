import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddOrderToSubjectSubsTable1724165215300 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("subject_subs", new TableColumn({
            name: "order_number",
            type: "tinyint",
        }))
        await queryRunner.addColumn("subject_sub_details", new TableColumn({
            name: "order_number",
            type: "tinyint",
        }))
        await queryRunner.addColumn("subject_sub_detail_contents", new TableColumn({
            name: "order_number",
            type: "tinyint",
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("subject_subs","order_number")
        await queryRunner.dropColumn("subject_sub_details","order_number")
        await queryRunner.dropColumn("subject_sub_detail_contents","order_number")
    }

}
