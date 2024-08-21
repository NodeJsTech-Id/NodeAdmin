import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { Subject } from './subject.entity'
import { SubjectSubDetail } from './subject_sub_detail.entity'

@Entity('subject_subs')
export class SubjectSub {
    @PrimaryGeneratedColumn('uuid')
    @Index('subject_subs__id')
    id!: string

    @Column({ length: 36 })
    @Index('subject_subs__subject_id')
    subject_id!: string

    @Column()
    @Index('subject_subs__name')
    name!: string

    @Column({ nullable: true })
    @Index('subject_subs__desc')
    desc!: string

    @Column()
    order_number!: number

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToOne(() => Subject, (subject) => subject.subject_subs)
    @JoinColumn({ name: 'subject_id' })
    subject!: Subject

    @OneToMany(() => SubjectSubDetail, (subject_sub_detail) => subject_sub_detail.subject_sub)
    subject_sub_details!: SubjectSubDetail[]
}
