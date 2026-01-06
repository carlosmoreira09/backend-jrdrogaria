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
import { SupplierPrice } from './SupplierPrice';

export type SupplierQuotationStatus = 'pending' | 'in_progress' | 'submitted';

@Entity()
@Index(['status'])
export class SupplierQuotation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  accessToken!: string;

  @ManyToOne(() => QuotationRequest, (qr) => qr.supplierQuotations, { nullable: false, onDelete: 'CASCADE' })
  quotationRequest!: QuotationRequest;

  @ManyToOne(() => Supplier, { nullable: false })
  supplier!: Supplier;

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

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
