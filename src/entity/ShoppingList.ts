import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

import {Tenant} from "./Tenant";
export interface ProductData {
    product: string;
    stock: number;
}
@Entity()
@Index(['id'])
export class ShoppingList {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    list_name!: string;

    @Column({ type: 'json', nullable: true })
    products?: ProductData[]

    @ManyToOne(() => Tenant, tenant => tenant.products, { nullable: true })
    tenants?: Tenant;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    update_at!: Date;

    @DeleteDateColumn()
    delete_at?: Date;

}