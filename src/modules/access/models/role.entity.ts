import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, Index, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { Permission } from './permission.entity'

enum StatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Index('roles__id')
  id!: string

  @Column()
  @Index('roles__name', { unique: true })
  name!: string

  // guard_name = jalur auth role ('web' panel sesi / 'api' REST+JWT) — dipakai
  // untuk filter & kategorisasi. varchar (bukan ENUM) agar portabel lintas dialek.
  @Column({ type: 'varchar', length: 20, default: 'web' })
  @Index('roles__guard')
  guard_name!: string

  // varchar + enum TS (bukan native ENUM) agar seragam di semua dialek TypeORM
  @Column({ type: 'varchar', length: 20, default: StatusEnum.ACTIVE })
  @Index('roles__status')
  status!: StatusEnum

  @Column({ nullable: true })
  @Index('roles__desc')
  desc!: string

  @Column({ nullable: true })
  created_by!: string

  @Column({ nullable: true })
  updated_by!: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToMany(() => User, user => user.roles)
  users!: User[]

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'role_id', // Kolom dalam tabel join yang mereferensikan Role
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id', // Kolom dalam tabel join yang mereferensikan Permission
      referencedColumnName: 'id'
    }
  })
  permissions!: Permission[]
}
