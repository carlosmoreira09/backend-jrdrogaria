import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index, ManyToMany, JoinTable,
} from 'typeorm';
import {Tenant} from "./Tenant";


@Entity()
@Index(['id', 'product_name'])
export class Products {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    product_name!: string

    @Column()
    stock!: string

    @ManyToMany(() => Tenant, tenant => tenant.products, { nullable: true })
    @JoinTable()
    tenants!: Tenant[];
}
