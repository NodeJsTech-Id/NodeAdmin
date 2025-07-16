import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SubjectSub } from './subject_sub.entity'

@Entity('subject_sub_contents')
export class SubjectSubContent {
    @PrimaryGeneratedColumn('uuid')
    @Index('subject_sub_contents__id')
    id!: string

    @Column({ length: 36 })
    @Index('subject_sub_contents__subject_sub_id')
    subject_sub_id!: string

    @Column()
    @Index('subject_sub_contents__name')
    name!: string

    @Column()
    @Index('subject_sub_contents__content')
    content!: string

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

    @ManyToOne(() => SubjectSub, (subject_sub) => subject_sub.subject_sub_contents)
    @JoinColumn({ name: 'subject_sub_id' })
    subject_sub!: SubjectSub
}
