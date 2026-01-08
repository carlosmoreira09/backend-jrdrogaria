import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Users } from "./Users";
import { ShoppingList } from "./ShoppingList";
import { Store } from "./Store";

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type TenantPlan = 'free' | 'pro' | 'enterprise';

export interface TenantSettings {
    currency: string;
    timezone: string;
    whatsappEnabled: boolean;
}

@Entity()
@Index(['status'])
export class Tenant {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column({ unique: true })
    slug!: string;

    @Column({ unique: true, nullable: true })
    domain?: string;

    @Column({ nullable: true })
    whatsAppNumber?: string;

    @Column({ type: 'enum', enum: ['active', 'suspended', 'trial', 'cancelled'], default: 'trial' })
    status!: TenantStatus;

    @Column({ type: 'enum', enum: ['free', 'pro', 'enterprise'], default: 'free' })
    plan!: TenantPlan;

    @Column({ type: 'json', nullable: true })
    settings?: TenantSettings;

    @OneToMany(() => Store, store => store.tenant)
    stores!: Store[];

    @OneToMany(() => ShoppingList, shoppingList => shoppingList.tenants, { nullable: true })
    shoppingList?: ShoppingList[];

    @OneToMany(() => Users, user => user.tenant, { nullable: true })
    users!: Users[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
