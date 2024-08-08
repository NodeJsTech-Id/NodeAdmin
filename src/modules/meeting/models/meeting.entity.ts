import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn, OneToOne } from 'typeorm'
import { StatusEnum } from '../../../enums/StatusEnum'
import { Room } from '../../room/models/room.entity'
import { Class } from '../../class/models/class.entity'
import { Schedule } from '../../schedule/models/schedule.entity'
import { User } from '../../access/models/user.entity'
import { MeetingDetail } from './meeting_detail.entity'

@Entity('meetings')
export class Meeting {
    @PrimaryGeneratedColumn('uuid')
    @Index('meetings__id')
    id!: string

    @Column()
    @Index('meetings__room_id')
    room_id!: string

    @Column()
    @Index('meetings__class_id')
    class_id!: string

    @Column()
    @Index('meetings__mentor_id')
    mentor_id!: string

    @Column()
    @Index('meetings__meeting_number')
    meeting_number!: number

    @Column()
    @Index('meetings__date_start')
    date_start!: Date

    @Column()
    @Index('meetings__date_end')
    date_end!: Date

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('meetings__status')
    status!: StatusEnum

    @Column()
    @Index('meetings__desc')
    desc!: string

    @ManyToOne(() => Room, room => room.meetings)
    @JoinColumn({ name: "room_id" })
    room!: Room

    @ManyToOne(() => Class, classData => classData.meetings)
    @JoinColumn({ name: "class_id" })
    class!: Class

    @ManyToMany(() => Schedule, schedule => schedule.meetings)
    @JoinTable({
        name: 'meetings_schedules',
        joinColumn: {
            name: 'meeting_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'schedule_id',
            referencedColumnName: 'id'
        }
    })
    schedules!: Schedule[]

    @ManyToMany(() => User, user => user.meetings)
    @JoinTable({
        name: 'meetings_users',
        joinColumn: {
            name: 'meeting_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        }
    })
    users!: User[]

    @OneToMany(() => MeetingDetail, meetingDetail => meetingDetail.meeting)
    details!: MeetingDetail[]

    @ManyToOne(() => User, user => user.meeting_mentored)
    @JoinColumn({ name: "mentor_id" })
    mentor!: User
}