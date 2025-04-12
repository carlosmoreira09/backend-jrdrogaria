import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index, ManyToMany, JoinTable, ManyToOne, OneToMany, OneToOne, JoinColumn,
} from 'typeorm';
import {Tenant} from "./Tenant";
import {ShoppingList} from "./ShoppingList";


@Entity()
@Index(['id', 'product_name'])
export class Products {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    product_name!: string

    @ManyToOne(() => ShoppingList, list => list.products,
        {
            nullable: true
        })
    @JoinColumn({
        name:"shoppinglistID"
    })
    list?: ShoppingList;

    @ManyToOne(() => Tenant, tenant => tenant.products, { nullable: true })
    tenants?: Tenant;
}
