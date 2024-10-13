import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFieldInSettingsTable1728793420162 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns('settings',[
            'facebook',
            'twitter',
            'google',
            'instagram',
            'maps_key',
            'latitude',
            'longitude',
            'api_key',
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
