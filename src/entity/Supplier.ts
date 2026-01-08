import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    DeleteDateColumn,
    ManyToOne
} from 'typeorm';
import { Tenant } from './Tenant';

export type SupplierStatus = 'active' | 'inactive';

@Entity()
@Index(['tenant', 'supplier_name'])
@Index(['tenant', 'status'])
export class Supplier {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Tenant, { nullable: false })
    tenant!: Tenant;

    @Column()
    supplier_name!: string;

    @Column({ nullable: true })
    cnpj?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    whatsAppNumber?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    payment_term?: string;

    @Column({ nullable: true })
    contactName?: string;

    @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
    status!: SupplierStatus;

    @CreateDateColumn()
    created_at!: Date;

    @DeleteDateColumn()
    deleted_at?: Date;
}
