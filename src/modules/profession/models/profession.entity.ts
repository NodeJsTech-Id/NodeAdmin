import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { StatusEnum } from '../../../enums/StatusEnum'
import { UserProfile } from '../../access/models/user_profile.entity'

@Entity('professions')
export class Profession {
    @PrimaryGeneratedColumn('uuid')
    @Index('professions__id')
    id!: string

    @Column()
    @Index('professions__name')
    name!: string

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('professions__status')
    status!: StatusEnum

    @Column({ nullable: true })
    @Index('professions__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => UserProfile, user_profile => user_profile.profession)
    user_profiles!: UserProfile[]
}
