import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    CreateDateColumn
} from 'typeorm';
import { Tenant } from './Tenant';

@Entity()
@Index(['tenant', 'product_name'])
@Index(['tenant', 'sku'])
@Index(['tenant', 'barcode'])
export class Products {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Tenant, { nullable: true })
    tenant?: Tenant;

    @Column()
    product_name!: string;

    @Column({ nullable: true })
    sku?: string;

    @Column({ nullable: true })
    barcode?: string;

    @Column({ nullable: true })
    category?: string;

    @Column({ nullable: true })
    unit?: string;

    @Column({ default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
