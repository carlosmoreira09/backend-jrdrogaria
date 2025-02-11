import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, ManyToMany, JoinTable, Index } from 'typeorm';
import {Users} from "./Users";
import {Products} from "./Products";

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

    @OneToMany(() => Users, user => user.tenants)
    admins!: Users[];

    @ManyToMany(() => Products, product => product.tenants, { nullable: true })
    @JoinTable()
    products!: Products[];

    @CreateDateColumn()
    created_at!: Date;
}
