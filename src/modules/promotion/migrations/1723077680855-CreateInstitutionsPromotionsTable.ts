import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInstitutionsPromotionsTable1723077680855 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "institutions_promotions",
                columns: [
                    {
                        name: "institution_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "promotion_id",
                        type: "varchar",
                        length: "36",
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("institutions_promotions",true)
    }

}
