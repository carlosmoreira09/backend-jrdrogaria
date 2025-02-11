import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index, ManyToMany, JoinTable, ManyToOne,
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

    @ManyToOne(() => Tenant, tenant => tenant.products, { nullable: true })
    tenants?: Tenant;
}
