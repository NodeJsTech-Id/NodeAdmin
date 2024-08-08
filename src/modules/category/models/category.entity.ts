import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Subject } from '../../subject/models/subject.entity'

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    @Index('categories__id')
    id!: string

    @Column()
    @Index('categories__name')
    name!: string

    @Column({ nullable: true })
    @Index('categories__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => Subject, subject => subject.category)
    subjects!: Subject[]
}
