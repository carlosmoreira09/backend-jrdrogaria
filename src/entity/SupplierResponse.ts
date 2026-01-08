/**
 * SupplierResponse - Resposta do fornecedor a uma cotação
 * Store-scoped
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Store } from './Store';
import { QuotationRequest } from './QuotationRequest';
import { Supplier } from './Supplier';
import { SupplierResponseItem } from './SupplierResponseItem';

export type SupplierResponseStatus = 'pending' | 'in_progress' | 'submitted';

@Entity('supplier_responses')
@Index(['tenant', 'store', 'quotation'])
@Index(['tenant', 'store', 'supplier'])
@Index(['tenant', 'store', 'status'])
export class SupplierResponse {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Store, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store!: Store;

  @ManyToOne(() => QuotationRequest, { nullable: false })
  @JoinColumn({ name: 'quotation_id' })
  quotation!: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: Supplier;

  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'submitted'], default: 'pending' })
  status!: SupplierResponseStatus;

  @Column({ type: 'datetime', nullable: true, name: 'submitted_at' })
  submitted_at?: Date;

  @OneToMany(() => SupplierResponseItem, item => item.response, { cascade: true })
  items!: SupplierResponseItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
