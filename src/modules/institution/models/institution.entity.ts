import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { StatusEnum } from "../../../enums/StatusEnum";
import { User } from "../../access/models/user.entity";
import { InstitutionUser } from "./institution_user.entity";
import { Promotion } from "../../promotion/models/v1/promotion.entity";

@Entity("institutions")
export class Institution {
    @PrimaryGeneratedColumn("uuid")
    @Index("institutions__id")
    id!: string

    @Column()
    @Index("institutions__user_id")
    user_id!: string

    @Column()
    @Index("institutions__name")
    name!: string

    @Column()
    @Index("institutions__type")
    type!: string

    @Column()
    @Index("institutions__code")
    code!: string

    @Column()
    @Index("institutions__refferal")
    refferal!: string

    @Column()
    @Index("institutions__address")
    address!: string

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.ACTIVE
    })
    @Index('institutions__status')
    status!: StatusEnum

    @ManyToOne(() => User, user => user.institutions)
    @JoinColumn({ name: "user_id" })
    user!: User

    @OneToMany(() => InstitutionUser, institutionUser => institutionUser.institution)
    users!: InstitutionUser[]

    @ManyToMany(() => Promotion, promotion => promotion.institutions)
    @JoinTable({
        name: 'institutions_promotions',
        joinColumn: {
            name: 'institution_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'promotion_id',
            referencedColumnName: 'id'
        }
    })
    promotions!: Promotion[]
}