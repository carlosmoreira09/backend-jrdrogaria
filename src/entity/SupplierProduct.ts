/**
 * SupplierProduct - Catálogo do fornecedor (até 5k itens)
 * Tenant-scoped
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Supplier } from './Supplier';

@Entity('supplier_products')
@Index(['tenant', 'supplier', 'supplier_sku'], { unique: true })
@Index(['tenant', 'supplier', 'ean'])
@Index(['tenant', 'supplier', 'is_active'])
export class SupplierProduct {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @Column({ name: 'supplier_sku' })
  supplier_sku!: string;

  @Column({ nullable: true })
  ean?: string;

  @Column({ name: 'name_raw' })
  name_raw!: string;

  @Column({ type: 'int', nullable: true, name: 'pack_qty' })
  pack_qty?: number;

  @Column({ default: true, name: 'is_active' })
  is_active!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
