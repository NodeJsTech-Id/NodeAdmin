import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { SubjectSubDetail } from './subject_sub_detail.entity'

@Entity('subject_sub_detail_contents')
export class SubjectSubDetailContent {
    @PrimaryGeneratedColumn('uuid')
    @Index('subject_sub_detail_contents__id')
    id!: string

    @Column({ length: 36 })
    @Index('subject_sub_detail_contents__subject_sub_detail_id')
    subject_sub_detail_id!: string

    @Column()
    @Index('subject_sub_detail_contents__name')
    name!: string

    @Column()
    @Index('subject_sub_detail_contents__content')
    content!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToOne(() => SubjectSubDetail, (subject_sub_detail) => subject_sub_detail.subject_sub_detail_contents)
    @JoinColumn({ name: 'subject_sub_detail_id' })
    subject_sub_detail!: SubjectSubDetail
}
