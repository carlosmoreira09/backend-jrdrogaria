import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index
} from 'typeorm';
import { Tenant } from './Tenant';

export type StoreStatus = 'active' | 'inactive';

@Entity()
@Index(['tenant', 'code'], { unique: true })
@Index(['tenant', 'status'])
export class Store {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Tenant, tenant => tenant.stores, { nullable: false })
    tenant!: Tenant;

    @Column()
    name!: string;

    @Column({ nullable: true })
    code?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status!: StoreStatus;

    @Column({ type: 'int', default: 0 })
    sortOrder!: number;

    @CreateDateColumn()
    created_at!: Date;
}
