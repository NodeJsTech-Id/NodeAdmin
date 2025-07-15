import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateInstitutionsTable1722986426986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "institutions",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "user_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "name",
                    type: "varchar",
                },
                {
                    name: "type",
                    type: "varchar",
                },
                {
                    name: "code",
                    type: "varchar",
                },
                {
                    name: "refferal",
                    type: "varchar",
                },
                {
                    name: "address",
                    type: "varchar",
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["Active","Inactive"]
                },
            ],
            indices: [
                {
                    name: "institutions__id",
                    columnNames: ["id"],
                },
                {
                    name: "institutions__user_id",
                    columnNames: ["user_id"],
                },
                {
                    name: "institutions__name",
                    columnNames: ["name"],
                },
                {
                    name: "institutions__type",
                    columnNames: ["type"],
                },
                {
                    name: "institutions__code",
                    columnNames: ["code"],
                },
                {
                    name: "institutions__refferal",
                    columnNames: ["refferal"],
                },
                {
                    name: "institutions__address",
                    columnNames: ["address"],
                },
                {
                    name: "institutions__status",
                    columnNames: ["status"],
                },
            ]
        }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("institutions",true)
    }

}
