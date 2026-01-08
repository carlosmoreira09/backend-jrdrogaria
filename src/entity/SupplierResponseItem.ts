/**
 * SupplierResponseItem - Item da resposta do fornecedor
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { SupplierResponse } from './SupplierResponse';
import { Products } from './Products';

@Entity('supplier_response_items')
export class SupplierResponseItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SupplierResponse, response => response.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'response_id' })
  response!: SupplierResponse;

  @ManyToOne(() => Products, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Products;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, name: 'unit_price' })
  unit_price?: number;

  @Column({ default: true })
  available!: boolean;

  @Column({ nullable: true })
  observation?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
