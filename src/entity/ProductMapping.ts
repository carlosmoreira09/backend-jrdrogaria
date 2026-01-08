/**
 * ProductMapping - Match fornecedor ↔ catálogo interno
 * Tenant-scoped
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Supplier } from './Supplier';
import { SupplierProduct } from './SupplierProduct';
import { Products } from './Products';

@Entity('product_mappings')
@Index(['tenant', 'supplier', 'supplier_product'], { unique: true })
@Index(['tenant', 'product'])
export class ProductMapping {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @ManyToOne(() => SupplierProduct, { nullable: false })
  @JoinColumn({ name: 'supplier_product_id' })
  supplier_product!: SupplierProduct;

  @ManyToOne(() => Products, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product!: Products;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
