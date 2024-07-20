import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Index, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { Access } from './access.entity'
import { StatusEnum } from '../../../enums/StatusEnum'

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Index('roles__id')
  id!: string

  @Column()
  @Index('roles__name', { unique: true })
  name!: string

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE
  })
  @Index('roles__status')
  status!: StatusEnum

  @Column({ nullable: true })
  @Index('roles__desc')
  desc!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  @ManyToMany(() => User, user => user.roles)
  users!: User[]

  @ManyToMany(() => Access, access => access.roles)
  @JoinTable({
    name: 'roles_accesses',
    joinColumn: {
      name: 'role_id', // Kolom dalam tabel join yang mereferensikan Role
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'access_id', // Kolom dalam tabel join yang mereferensikan Access
      referencedColumnName: 'id'
    }
  })
  accesses!: Access[]
}
