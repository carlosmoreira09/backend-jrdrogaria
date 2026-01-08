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
import { PurchaseOrder } from './PurchaseOrder';
import { Products } from './Products';

@Entity()
@Index(['tenant', 'store', 'purchaseOrder'])
@Index(['tenant', 'store', 'product'])
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant?: Tenant;

  @ManyToOne(() => Store, { nullable: true })
  store?: Store;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { nullable: false, onDelete: 'CASCADE' })
  purchaseOrder!: PurchaseOrder;

  @ManyToOne(() => Products, { nullable: false })
  product!: Products;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
