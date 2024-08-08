import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../access/models/user.entity'
import { MeetingDetail } from './meeting_detail.entity'

@Entity('meeting_detail_presences')
export class MeetingDetailPresence {
    @PrimaryGeneratedColumn('uuid')
    @Index('meeting_detail_presences__id')
    id!: string

    @Column()
    @Index('meeting_detail_presences__meeting_detail_id')
    meeting_detail_id!: string

    @Column()
    @Index('meeting_detail_presences__user_id')
    user_id!: string

    @Column()
    @Index('meeting_detail_presences__status')
    status!: string

    @Column()
    @Index('meeting_detail_presences__desc')
    desc!: string

    @ManyToOne(() => MeetingDetail, meetingDetail => meetingDetail.user_presences)
    @JoinColumn({ name: "meeting_detail_id" })
    meeting_detail!: MeetingDetail

    @ManyToOne(() => User, user => user.meeting_presences)
    @JoinColumn({ name: "user_id" })
    user!: User
}