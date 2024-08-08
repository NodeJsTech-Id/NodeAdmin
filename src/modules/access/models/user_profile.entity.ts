import { Entity, PrimaryGeneratedColumn, Column, Index, UpdateDateColumn, CreateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { User } from './user.entity'
import { Profession } from '../../profession/models/profession.entity'

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  @Index('user_profiles__id')
  id!: string

  @Column()
  @Index('user_profiles__user_id')
  user_id!: string

  @Column({ nullable: true })
  @Index('user_profiles__profession_id')
  profession_id!: string

  @Column({ nullable: true })
  @Index('user_profiles__biography')
  biography!: string

  @Column({ nullable: true })
  @Index('user_profiles__address')
  address!: string

  @Column({ nullable: true })
  @Index('user_profiles__office_name')
  office_name!: string

  @Column({ nullable: true })
  @Index('user_profiles__office_address')
  office_address!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  @OneToOne(() => User, user => user.user_profile)
  @JoinColumn({ name: 'user_id' })
  user!: User

  @ManyToOne(() => Profession, profession => profession.user_profiles)
  @JoinColumn({ name: "profession_id" })
  profession!: Profession
}
