import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { SubjectSub } from './subject_sub.entity'
import { Class } from '../../class/models/class.entity'
import { Category } from '../../category/models/category.entity'
import { SubjectFile } from './subject_file.entity'

@Entity('subjects')
export class Subject {
    @PrimaryGeneratedColumn('uuid')
    @Index('subjects__id')
    id!: string

    @Column()
    @Index('subjects__name')
    name!: string

    @Column({ nullable: true })
    @Index('subjects__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => SubjectSub, (subject_sub) => subject_sub.subject)
    subject_subs!: SubjectSub[]

    @ManyToMany(() => Class, classEntity => classEntity.subjects)
    classes!: Class[]

    // @ManyToOne(() => Category, category => category.subjects)
    // @JoinColumn({ name: "category_id" })
    // category!: Category
    @ManyToMany(() => Category, category => category.subjects)
    @JoinTable({
        name: 'subjects_categories',
        joinColumn: {
            name: 'subject_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'category_id',
            referencedColumnName: 'id'
        }
    })
    categories!: Category[]

    @OneToMany(() => SubjectFile, (subject_file) => subject_file.subject)
    subject_files!: SubjectFile[]
}
