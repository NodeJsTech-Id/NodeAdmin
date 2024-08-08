import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Meeting } from './meeting.entity'
import { MeetingDetailPresence } from './meeting_detail_presence.entity'

@Entity('meeting_details')
export class MeetingDetail {
    @PrimaryGeneratedColumn('uuid')
    @Index('meeting_details__id')
    id!: string

    @Column()
    @Index('meeting_details__meeting_id')
    meeting_id!: string

    @Column()
    @Index('meeting_details__date_start')
    date_start!: Date

    @Column()
    @Index('meeting_details__date_end')
    date_end!: Date

    @Column()
    @Index('meeting_details__time_start')
    time_start!: string

    @Column()
    @Index('meeting_details__time_end')
    time_end!: string

    @Column({ nullable: true })
    @Index('meeting_details__meeting_code')
    meeting_code!: string

    @Column()
    duration!: number

    @Column({ type: 'json', nullable: true })
    credential!: any

    @Column()
    status!: string

    @Column({ nullable: true })
    desc!: string

    @ManyToOne(() => Meeting, meeting => meeting.details)
    @JoinColumn({ name: "meeting_id" })
    meeting!: Meeting

    @OneToMany(() => MeetingDetailPresence, presence => presence.meeting_detail)
    user_presences!: MeetingDetailPresence[]
}