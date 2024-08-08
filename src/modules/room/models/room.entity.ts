import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Meeting } from '../../meeting/models/meeting.entity'

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn('uuid')
    @Index('rooms__id')
    id!: string

    @Column()
    @Index('rooms__name')
    name!: string

    @Column({ nullable: true })
    @Index('rooms__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => Meeting, meeting => meeting.room)
    meetings!: Meeting[]
}
