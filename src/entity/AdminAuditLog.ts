/**
 * AdminAuditLog - Log de auditoria das ações dos admins
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
import { AdminUser } from './AdminUser';
import { Tenant } from './Tenant';

@Entity('admin_audit_logs')
@Index(['admin_user', 'created_at'])
@Index(['tenant', 'created_at'])
@Index(['action', 'created_at'])
export class AdminAuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AdminUser, { nullable: false })
  @JoinColumn({ name: 'admin_user_id' })
  admin_user!: AdminUser;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant?: Tenant;

  @Column()
  action!: string;

  @Column({ type: 'json', nullable: true })
  details?: Record<string, any>;

  @Column({ nullable: true, name: 'ip_address' })
  ip_address?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
