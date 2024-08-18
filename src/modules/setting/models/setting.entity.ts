import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('settings')
export class Setting {
    @PrimaryColumn({ type: 'char', length: 36, collation: 'utf8mb4_unicode_ci' })
    id?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    initial?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    name?: string

    @Column({ type: 'longtext', nullable: true, collation: 'utf8mb4_unicode_ci' })
    description?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    icon?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    logo?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    login_image?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    phone?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    address?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index('settings__setting_email')
    email?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    facebook?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    twitter?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    google?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    instagram?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    copyright?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    maps_key?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    latitude?: string

    @Column({ type: 'varchar', length: 255, nullable: true, collation: 'utf8mb4_unicode_ci' })
    @Index()
    longitude?: string

    @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
    api_key?: string

    @Column({ nullable: true })
    mail_from_address?: string

    @Column({ nullable: true })
    mail_from_name?: string

    @Column({ nullable: true })
    mail_mailer?: string

    @Column({ nullable: true })
    mail_host?: string

    @Column({ nullable: true })
    mail_port?: string

    @Column({ nullable: true })
    mail_username?: string

    @Column({ nullable: true })
    mail_password?: string

    @Column({ type: 'char', length: 36, nullable: true, collation: 'utf8mb4_unicode_ci' })
    created_by?: string

    @Column({ type: 'char', length: 36, nullable: true, collation: 'utf8mb4_unicode_ci' })
    updated_by?: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at?: Date

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at?: Date
}