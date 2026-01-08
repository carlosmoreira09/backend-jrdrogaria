import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    UpdateDateColumn
} from 'typeorm';
import { Tenant } from './Tenant';
import { UserStore } from './UserStore';

export type UserRole = 'tenant_owner' | 'admin' | 'buyer' | 'finance' | 'viewer';
export type UserStatus = 'active' | 'inactive';

@Entity()
@Index(['tenant', 'email'], { unique: true })
@Index(['tenant', 'status'])
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Tenant, tenant => tenant.users, { nullable: false })
    tenant!: Tenant;

    @Column()
    email!: string;

    @Column()
    fullName!: string;

    @Column()
    password!: string;

    @Column({ type: 'enum', enum: ['tenant_owner', 'admin', 'buyer', 'finance', 'viewer'], default: 'viewer' })
    role!: UserRole;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status!: UserStatus;

    @OneToMany(() => UserStore, userStore => userStore.user)
    userStores!: UserStore[];

    @Column({ type: 'datetime', nullable: true })
    last_login_at?: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at?: Date;
}
