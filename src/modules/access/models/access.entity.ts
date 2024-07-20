import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index, CreateDateColumn, UpdateDateColumn, JoinTable } from 'typeorm'
import { Role } from './role.entity'
import { StatusEnum } from '../../../enums/StatusEnum'

@Entity('accesses')
export class Access {
  @PrimaryGeneratedColumn('uuid')
  @Index('accesses__id')
  id!: string

  @Column()
  @Index('accesses__url')
  url!: string

  @Column()
  @Index('accesses__method')
  method!: string

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  @Index('accesses__status')
  status!: StatusEnum

  @Column({ nullable: true })
  @Index('accesses__desc')
  desc!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  @ManyToMany(() => Role, role => role.accesses)
  roles!: Access[]
}
