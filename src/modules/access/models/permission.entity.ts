import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { Role } from './role.entity'

enum StatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @Index('permissions__id')
  id!: string

  @Column()
  @Index('permissions__url')
  url!: string

  @Column()
  @Index('permissions__method')
  method!: string

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  @Index('permissions__status')
  status!: StatusEnum

  @Column({ nullable: true })
  @Index('permissions__desc')
  desc!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  @ManyToMany(() => Role, role => role.permissions)
  roles!: Role[]
}
