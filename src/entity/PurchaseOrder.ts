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
import { Store } from './Store';
import { Users } from './Users';
import { PurchaseOrderItem } from './PurchaseOrderItem';

export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'sent' | 'delivered';

@Entity()
@Index(['tenant', 'orderNumber'], { unique: true })
@Index(['tenant', 'store', 'created_at'])
@Index(['tenant', 'store', 'status'])
@Index(['tenant', 'store', 'supplier'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant?: Tenant;

  @ManyToOne(() => Store, { nullable: true })
  store?: Store;

  @Column()
  orderNumber!: string;

  @ManyToOne(() => QuotationRequest, { nullable: true })
  quotationRequest?: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: false })
  supplier!: Supplier;

  @Column({ type: 'enum', enum: ['draft', 'confirmed', 'sent', 'delivered'], default: 'draft' })
  status!: PurchaseOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue!: number;

  @ManyToOne(() => Users, { nullable: true })
  created_by_user?: Users;

  @OneToMany(() => PurchaseOrderItem, (poi) => poi.purchaseOrder, { cascade: true })
  items!: PurchaseOrderItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
