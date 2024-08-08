import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, Index, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm'
import { Role } from './role.entity'
import { StatusEnum } from '../../../enums/StatusEnum'
import { Class } from '../../class/models/class.entity'
import { Meeting } from '../../meeting/models/meeting.entity'
import { MeetingDetailPresence } from '../../meeting/models/meeting_detail_presence.entity'
import { UserProfile } from './user_profile.entity'
import { Institution } from '../../institution/models/institution.entity'
import { InstitutionUser } from '../../institution/models/institution_user.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Index('users__id')
  id!: string

  @Column({ length: 20 })
  @Index('users__code', { unique: true })
  code!: string

  @Column({ length: 50 })
  @Index('users__name')
  name!: string

  @Column({ length: 15, nullable: true })
  @Index('users__phone')
  phone!: string

  @Column()
  @Index('users__email', { unique: true })
  email!: string

  @Column({ nullable: true })
  email_verified_at!: Date

  @Column()
  password!: string

  @Column({ nullable: true })
  password_otp!: string

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  @Index('users__status')
  status!: StatusEnum

  @Column({ nullable: true })
  picture!: string

  @Column({ default: false })
  @Index('users__blocked')
  blocked!: boolean

  @Column({ nullable: true })
  blocked_reason!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  @OneToOne(() => UserProfile, user => user.user)
  user_profile!: UserProfile

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'user_id', // Kolom dalam tabel join yang mereferensikan User
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id', // Kolom dalam tabel join yang mereferensikan Role
      referencedColumnName: 'id'
    }
  })
  roles!: Role[]

  @ManyToMany(() => Class, classData => classData.users)
  classes!: Class[]

  @ManyToMany(() => Class, classData => classData.mentors)
  class_mentored!: Class[]

  @ManyToMany(() => Meeting, meeting => meeting.schedules)
  meetings!: Meeting[]

  @OneToMany(() => Meeting, meeting => meeting.mentor)
  meeting_mentored!: Meeting[]

  @OneToMany(() => MeetingDetailPresence, meeting => meeting.user)
  meeting_presences!: MeetingDetailPresence[]

  @OneToMany(() => Institution, institution => institution.user)
  institutions!: Institution[]

  @OneToMany(() => InstitutionUser, institutionUser => institutionUser.user)
  user_institutions!: InstitutionUser[]
}