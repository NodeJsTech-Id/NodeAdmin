import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateNewsTable1722077820190 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "news",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: "36",
                        isPrimary: true,
                    },
                    {
                        name: "category_id",
                        type: "varchar",
                        length: "36",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "slug",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "desc",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "summary",
                        type: "text",
                    },
                    {
                        name: "content",
                        type: "longtext",
                    },
                    {
                        name: "image",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["Publish", "Draft"],
                    },
                    {
                        name: "featured",
                        type: "tinyint",
                        length: "1",
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
                        name: "news__id",
                        columnNames: ["id"]
                    },
                    {
                        name: "news__category_id",
                        columnNames: ["category_id"]
                    },
                    {
                        name: "news__title",
                        columnNames: ["title"]
                    },
                    {
                        name: "news__slug",
                        columnNames: ["slug"]
                    },
                ]
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("news")
    }

}
