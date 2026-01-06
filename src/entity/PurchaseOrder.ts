import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuotationRequest } from './QuotationRequest';
import { Supplier } from './Supplier';
import { Tenant } from './Tenant';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'sent' | 'delivered';

@Entity()
@Index(['orderNumber'], { unique: true })
@Index(['status'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderNumber!: string;

  @ManyToOne(() => QuotationRequest, { nullable: false })
  quotationRequest!: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: false })
  supplier!: Supplier;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @Column({ type: 'enum', enum: ['draft', 'confirmed', 'sent', 'delivered'], default: 'draft' })
  status!: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue!: number;

  @OneToMany(() => PurchaseOrderItem, (poi) => poi.purchaseOrder, { cascade: true })
  items!: PurchaseOrderItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
