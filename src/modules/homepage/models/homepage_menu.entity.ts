import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { StatusEnum } from '../../../enums/StatusEnum'

@Entity('homepage_menus')
export class HomepageMenu {
    @PrimaryGeneratedColumn('uuid')
    @Index('homepage_menus__id')
    id!: string

    @Column({ nullable: true })
    @Index('homepage_menus__menu_id')
    menu_id!: string

    @Column()
    @Index('homepage_menus__position')
    position!: string

    @Column()
    @Index('homepage_menus__name')
    name!: string

    @Column()
    url!: string

    @Column()
    target!: string

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('homepage_menus__status')
    status!: StatusEnum

    @Column()
    level!: number

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => HomepageMenu, meeting => meeting.parent)
    childs!: HomepageMenu[]

    @ManyToOne(() => HomepageMenu, meeting => meeting.childs)
    @JoinColumn({ name: "menu_id" })
    parent!: HomepageMenu
}
