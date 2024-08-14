import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { StatusPostEnum } from '../../../enums/StatusPostEnum'
import { NewsCategory } from './news_category.entity'

@Entity('news')
export class News {
    @PrimaryGeneratedColumn('uuid')
    @Index('news__id')
    id!: string

    @Column()
    @Index('news__category_id')
    category_id!: string

    @Column()
    @Index('news__title')
    title!: string

    @Column()
    @Index('news__slug')
    slug!: string

    @Column()
    desc!: string

    @Column()
    summary!: string

    @Column()
    content!: string

    @Column({ nullable: true })
    image!: string

    @Column({
        type: 'enum',
        enum: StatusPostEnum,
        default: StatusPostEnum.DRAFT
    })
    status!: StatusPostEnum

    @Column()
    featured!: boolean

    @Column()
    created_by!: string

    @Column()
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @ManyToOne(() => NewsCategory, newsCategory => newsCategory.news)
    @JoinColumn({ name: "category_id" })
    category!: NewsCategory
}
