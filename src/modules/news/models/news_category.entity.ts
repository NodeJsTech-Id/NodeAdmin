import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { News } from './news.entity'

@Entity('news_categories')
export class NewsCategory {
    @PrimaryGeneratedColumn('uuid')
    @Index('news_categories__id')
    id!: string

    @Column()
    @Index('news_categories__name')
    name!: string

    @Column({ nullable: true })
    @Index('news_categories__desc')
    desc!: string

    @Column({ nullable: true })
    created_by!: string

    @Column({ nullable: true })
    updated_by!: string

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date

    @OneToMany(() => News, news => news.category)
    news!: News[]
}
