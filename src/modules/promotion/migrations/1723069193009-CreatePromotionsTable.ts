import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePromotionsTable1723069193009 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "promotions",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "code",
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
                    name: "discount_percent_status",
                    type: "enum",
                    enum: ["Active","Inactive"],
                },
                {
                    name: "discount_percent",
                    type: "tinyint",
                },
                {
                    name: "discount_amount_status",
                    type: "enum",
                    enum: ["Active","Inactive"],
                },
                {
                    name: "discount_amount",
                    type: "int",
                },
                {
                    name: "period_type",
                    type: "enum",
                    enum: ["Unlimited","Limited"],
                },
                {
                    name: "period_start",
                    type: "date",
                },
                {
                    name: "period_end",
                    type: "date",
                },
                {
                    name: "number",
                    type: "int",
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
                    name: "promotions__id",
                    columnNames: ["id"]
                },
                {
                    name: "promotions__code",
                    columnNames: ["code"],
                    isUnique: true,
                },
                {
                    name: "promotions__discount_percent_status",
                    columnNames: ["discount_percent_status"]
                },
                {
                    name: "promotions__discount_percent",
                    columnNames: ["discount_percent"]
                },
                {
                    name: "promotions__discount_amount_status",
                    columnNames: ["discount_amount_status"]
                },
                {
                    name: "promotions__discount_amount",
                    columnNames: ["discount_amount"]
                },
                {
                    name: "promotions__period_type",
                    columnNames: ["period_type"]
                },
                {
                    name: "promotions__period_start",
                    columnNames: ["period_start"]
                },
                {
                    name: "promotions__period_end",
                    columnNames: ["period_end"]
                },
            ]
        }),true)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("promotions",true)
    }

}
