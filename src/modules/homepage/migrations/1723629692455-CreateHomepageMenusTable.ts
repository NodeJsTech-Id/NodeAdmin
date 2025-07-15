import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateHomepageMenusTable1723629692455 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "homepage_menus",
            columns: [
                {
                    name:"id",
                    type:"varchar",
                    length:"36",
                    isPrimary: true,
                },
                {
                    name: "menu_id",
                    type: "varchar",
                    length: "36",
                    isNullable: true,
                },
                {
                    name: "position",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "url",
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "target",
                    type: "varchar",
                    length: "10",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["Active","Inactive"]
                },
                {
                    name: "level",
                    type: "tinyint",
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
                    name: "homepage_menus__id",
                    columnNames: ["id"]
                },
                {
                    name: "homepage_menus__menu_id",
                    columnNames: ["menu_id"]
                },
                {
                    name: "homepage_menus__position",
                    columnNames: ["position"]
                },
                {
                    name: "homepage_menus__name",
                    columnNames: ["name"]
                },
                {
                    name: "homepage_menus__status",
                    columnNames: ["status"]
                },
            ]
        }),true)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("homepage_menus",true)
    }

}
