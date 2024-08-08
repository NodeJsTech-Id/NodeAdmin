import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SubjectSub } from './subject_sub.entity'

@Entity('subject_sub_details')
export class SubjectSubDetail {
    @PrimaryGeneratedColumn('uuid')
    @Index('subject_sub_details__id')
    id!: string

    @Column({ length: 36 })
    @Index('subject_sub_details__subject_sub_id')
    subject_sub_id!: string

    @Column()
    @Index('subject_sub_details__name')
    name!: string

    @Column({ nullable: true })
    @Index('subject_sub_details__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToOne(() => SubjectSub, (subject_sub) => subject_sub.subject_sub_details)
    @JoinColumn({ name: 'subject_sub_id' })
    subject_sub!: SubjectSub
}
