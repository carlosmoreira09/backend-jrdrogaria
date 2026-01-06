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
import { QuotationItem } from './QuotationItem';
import { SupplierQuotation } from './SupplierQuotation';

export type QuotationStatus = 'draft' | 'open' | 'closed' | 'completed';

@Entity()
@Index(['id'])
@Index(['status'])
export class QuotationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: ['draft', 'open', 'closed', 'completed'], default: 'draft' })
  status!: QuotationStatus;

  @Column({ type: 'datetime', nullable: true })
  deadline?: Date;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @OneToMany(() => QuotationItem, (item) => item.quotationRequest, { cascade: true })
  items!: QuotationItem[];

  @OneToMany(() => SupplierQuotation, (sq) => sq.quotationRequest, { cascade: true })
  supplierQuotations!: SupplierQuotation[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
