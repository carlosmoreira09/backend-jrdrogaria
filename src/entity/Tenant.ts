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

    @OneToMany(() => Users, user => user.tenants, { nullable: true })
    admins!: Users[];

    @OneToMany(() => Products, product => product.tenants, { nullable: true })
    products!: Products[];

    @CreateDateColumn()
    created_at!: Date;
}
