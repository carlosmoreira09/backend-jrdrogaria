import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupplierQuotation } from './SupplierQuotation';
import { Products } from './Products';

@Entity()
@Index(['supplierQuotation', 'product'], { unique: true })
@Index(['product'])
export class SupplierPrice {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SupplierQuotation, (sq) => sq.prices, { nullable: false, onDelete: 'CASCADE' })
  supplierQuotation!: SupplierQuotation;

  @ManyToOne(() => Products, { nullable: false })
  product!: Products;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unitPrice?: number;

  @Column({ nullable: true })
  observation?: string;

  @Column({ default: true })
  available!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
