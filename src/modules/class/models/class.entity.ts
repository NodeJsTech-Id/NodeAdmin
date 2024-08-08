import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm'
import { Subject } from '../../subject/models/subject.entity'
import { User } from '../../access/models/user.entity'
import { Meeting } from '../../meeting/models/meeting.entity'

@Entity('classes')
export class Class {
    @PrimaryGeneratedColumn('uuid')
    @Index('classes__id')
    id!: string

    @Column()
    @Index('classes__name')
    name!: string

    @Column({ nullable: true })
    @Index('classes__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToMany(() => Subject, subject => subject.classes)
    @JoinTable({
        name: 'classes_subjects',
        joinColumn: {
            name: 'class_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'subject_id',
            referencedColumnName: 'id'
        }
    })
    subjects!: Subject[]

    @ManyToMany(() => User, userData => userData.classes)
    @JoinTable({
        name: 'classes_users',
        joinColumn: {
        name: 'class_id',
        referencedColumnName: 'id'
        },
        inverseJoinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
        }
    })
    users!: User[]

    @ManyToMany(() => User, userData => userData.class_mentored)
    @JoinTable({
        name: 'classes_mentors',
        joinColumn: {
        name: 'class_id',
        referencedColumnName: 'id'
        },
        inverseJoinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
        }
    })
    mentors!: User[]

    @OneToMany(() => Meeting, meeting => meeting.room)
    meetings!: Meeting[]
}
