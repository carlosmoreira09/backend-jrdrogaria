import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Products} from "./Products";
import {Supplier} from "./Supplier";
import {Tenant} from "./Tenant";

@Entity()
@Index(['id'])
export class ShoppingList {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    list_name!: string;

    @ManyToOne(() => Products, products => products.id)
    products!: Products;

    @ManyToOne(() => Supplier, supplier => supplier.id, { nullable: true })
    supplier?: Supplier;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    supplier_price!: number;

    @ManyToOne(() => Tenant, tenant => tenant.products, { nullable: true })
    tenants?: Tenant;

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    delete_at?: Date;

}