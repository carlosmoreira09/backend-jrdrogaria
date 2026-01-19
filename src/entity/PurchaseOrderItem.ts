import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrder } from './PurchaseOrder';
import { Products } from './Products';
import { PharmacyQuantities } from './QuotationItem';

@Entity()
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { nullable: false, onDelete: 'CASCADE' })
  purchaseOrder!: PurchaseOrder;

  @ManyToOne(() => Products, { nullable: false })
  product!: Products;

  @Column({ type: 'json', nullable: false })
  quantities!: PharmacyQuantities;

  @Column({ type: 'int', nullable: true })
  orderQuantity!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  targetStore?: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
