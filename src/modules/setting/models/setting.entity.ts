import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
    @PrimaryColumn({ type: 'char', length: 36, collation: 'utf8mb4_unicode_ci' })
    id?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    initial?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    name?: string;

    @Column({ type: 'longtext', nullable: true, collation: 'utf8mb4_unicode_ci' })
    description?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    icon?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    logo?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    login_image?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    phone?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    address?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index('settings__setting_email')
    email?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    copyright?: string;

    @Column({ type: 'char', length: 36, nullable: true, collation: 'utf8mb4_unicode_ci' })
    created_by?: string;

    @Column({ type: 'char', length: 36, nullable: true, collation: 'utf8mb4_unicode_ci' })
    updated_by?: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at?: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at?: Date;
}