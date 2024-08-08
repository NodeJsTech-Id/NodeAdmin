import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm'
import { Meeting } from '../../meeting/models/meeting.entity'

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    @Index('schedules__id')
    id!: string

    @Column()
    @Index('schedules__name')
    name!: string

    @Column()
    @Index('schedules__day')
    day!: string

    @Column()
    @Index('schedules__start')
    start!: string

    @Column()
    @Index('schedules__end')
    end!: string

    @Column({ nullable: true })
    @Index('schedules__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToMany(() => Meeting, meeting => meeting.schedules)
    meetings!: Meeting[]
}
