import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Store } from './Store';
import { QuotationRequest } from './QuotationRequest';
import { Products } from './Products';

export type StoreQuantities = Record<string, number>;

@Entity()
@Index(['tenant', 'store', 'quotationRequest'])
@Index(['tenant', 'store', 'product'])
export class QuotationItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant?: Tenant;

  @ManyToOne(() => Store, { nullable: true })
  store?: Store;

  @ManyToOne(() => QuotationRequest, (qr) => qr.items, { nullable: false, onDelete: 'CASCADE' })
  quotationRequest!: QuotationRequest;

  @ManyToOne(() => Products, { nullable: false })
  product!: Products;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
