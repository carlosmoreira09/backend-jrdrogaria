import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuotationRequest } from './QuotationRequest';
import { Products } from './Products';

export type PharmacyQuantities = {
  JR: number;
  GS: number;
  BARAO: number;
  LB: number;
};

@Entity()
@Index(['id'])
@Index(['product'])
export class QuotationItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => QuotationRequest, (qr) => qr.items, { nullable: false, onDelete: 'CASCADE' })
  quotationRequest!: QuotationRequest;

  @ManyToOne(() => Products, { nullable: false })
  product!: Products;

  @Column({ type: 'json', nullable: false })
  quantities!: PharmacyQuantities;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalQuantity?: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;
}
