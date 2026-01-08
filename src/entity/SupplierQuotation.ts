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
import { Tenant } from './Tenant';
import { Store } from './Store';
import { QuotationRequest } from './QuotationRequest';
import { Supplier } from './Supplier';
import { SupplierPrice } from './SupplierPrice';

export type SupplierQuotationStatus = 'pending' | 'in_progress' | 'submitted';

@Entity()
@Index(['token_hash'], { unique: true })
@Index(['tenant', 'store', 'quotationRequest'])
@Index(['tenant', 'store', 'supplier'])
@Index(['tenant', 'store', 'status'])
export class SupplierQuotation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: true })
  tenant?: Tenant;

  @ManyToOne(() => Store, { nullable: true })
  store?: Store;

  @Column()
  token_hash!: string;

  @Column({ type: 'datetime', nullable: true })
  expires_at?: Date;

  @Column({ type: 'datetime', nullable: true })
  revoked_at?: Date;

  @ManyToOne(() => QuotationRequest, (qr) => qr.supplierQuotations, { nullable: false, onDelete: 'CASCADE' })
  quotationRequest!: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: true })
  supplier?: Supplier;

  @Column({ type: 'enum', enum: ['pending', 'in_progress', 'submitted'], default: 'pending' })
  status!: SupplierQuotationStatus;

  @Column({ type: 'datetime', nullable: true })
  submitted_at?: Date;

  @OneToMany(() => SupplierPrice, (sp) => sp.supplierQuotation, { cascade: true })
  prices!: SupplierPrice[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
