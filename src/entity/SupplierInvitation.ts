/**
 * SupplierInvitation - Token público (HASH SHA-256)
 * Store-scoped - usado para convidar fornecedores para cotações
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './Tenant';
import { Store } from './Store';
import { QuotationRequest } from './QuotationRequest';
import { Supplier } from './Supplier';

@Entity('supplier_invitations')
@Index(['token_hash'], { unique: true })
@Index(['tenant', 'store', 'quotation'])
@Index(['expires_at'])
export class SupplierInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @ManyToOne(() => Store, { nullable: false })
  @JoinColumn({ name: 'store_id' })
  store!: Store;

  @ManyToOne(() => QuotationRequest, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation!: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @Column({ name: 'token_hash' })
  token_hash!: string;

  @Column({ type: 'datetime', name: 'expires_at' })
  expires_at!: Date;

  @Column({ type: 'datetime', nullable: true, name: 'revoked_at' })
  revoked_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
