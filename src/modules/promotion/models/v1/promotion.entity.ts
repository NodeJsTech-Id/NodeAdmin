import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { StatusEnum } from "../../../../enums/StatusEnum"
import { TypePromotionEnum } from "../../../../enums/TypePromotionEnum"
import { Institution } from "../../../institution/models/institution.entity"

@Entity("promotions")
export class Promotion {
    @PrimaryGeneratedColumn("uuid")
    @Index("promotions__id")
    id!: string

    @Column({ unique: true })
    @Index("promotions__code")
    code!: string

    @Column()
    desc!: string

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('promotions__discount_percent_status')
    discount_percent_status!: StatusEnum

    @Column()
    @Index("promotions__discount_percent")
    discount_percent!: number

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('promotions__discount_amount_status')
    discount_amount_status!: StatusEnum

    @Column()
    @Index("promotions__discount_amount")
    discount_amount!: number

    @Column({
        type: 'enum',
        enum: TypePromotionEnum,
        default: TypePromotionEnum.LIMITED
    })
    @Index('promotions__period_type')
    period_type!: TypePromotionEnum

    @Column()
    @Index("promotions__period_start")
    period_start!: Date

    @Column()
    @Index("promotions__period_end")
    period_end!: Date

    @Column()
    number!: number

    @ManyToMany(() => Institution, institution => institution.promotions)
    institutions!: Institution[]
}