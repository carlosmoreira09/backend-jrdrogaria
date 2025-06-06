import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import {Users} from "./Users";
import {Products} from "./Products";
import {ShoppingList} from "./ShoppingList";

@Entity()
@Index(['id'])
export class Tenant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ unique: true })
    domain!: string;

    @Column()
    whatsAppNumber!: string;

    @OneToMany(() => ShoppingList, tenant => tenant.tenants, { nullable: true })
    shoppingList?: ShoppingList[];

    @OneToMany(() => Users, user => user.tenants, { nullable: true })
    admins!: Users[];

    @CreateDateColumn()
    created_at!: Date;
}
