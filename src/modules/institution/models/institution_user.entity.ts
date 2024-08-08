import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "../../access/models/user.entity"
import { Institution } from "./institution.entity"

@Entity("institution_users")
export class InstitutionUser {
    @PrimaryGeneratedColumn("uuid")
    @Index("institution_users__id")
    id!: string

    @Column()
    @Index("institution_users__institution_id")
    institution_id!: string

    @Column()
    @Index("institution_users__user_id")
    user_id!: string

    @Column()
    @Index("institution_users__status")
    status!: string

    @ManyToOne(() => Institution, institution => institution.users)
    @JoinColumn({ name: "institution_id" })
    institution!: Institution

    @ManyToOne(() => User, user => user.user_institutions)
    @JoinColumn({ name: "user_id" })
    user!: User
}