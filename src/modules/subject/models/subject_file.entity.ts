import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { Subject } from './subject.entity'

@Entity('subject_files')
export class SubjectFile {
    @PrimaryGeneratedColumn('uuid')
    @Index('subject_files__id')
    id!: string

    @Column({ length: 36 })
    @Index('subject_files__subject_id')
    subject_id!: string

    @Column({ nullable: true })
    @Index('subject_files__path')
    path!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @ManyToOne(() => Subject, (subject) => subject.subject_files)
    @JoinColumn({ name: 'subject_id' })
    subject!: Subject
}
