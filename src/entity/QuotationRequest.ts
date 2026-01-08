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
import { Users } from './Users';
import { QuotationItem } from './QuotationItem';
import { SupplierQuotation } from './SupplierQuotation';

export type QuotationStatus = 'draft' | 'open' | 'closed' | 'completed';

@Entity()
@Index(['tenant', 'store', 'created_at'])
@Index(['tenant', 'store', 'status'])
export class QuotationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant!: Tenant;

  @ManyToOne(() => Store, { nullable: false })
  store!: Store;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: ['draft', 'open', 'closed', 'completed'], default: 'draft' })
  status!: QuotationStatus;

  @Column({ type: 'datetime', nullable: true })
  deadline?: Date;

  @ManyToOne(() => Users, { nullable: true })
  created_by_user?: Users;

  @OneToMany(() => QuotationItem, (item) => item.quotationRequest, { cascade: true })
  items!: QuotationItem[];

  @OneToMany(() => SupplierQuotation, (sq) => sq.quotationRequest, { cascade: true })
  supplierQuotations!: SupplierQuotation[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
