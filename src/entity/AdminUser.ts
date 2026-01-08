/**
 * AdminUser - Super Admin do sistema (gestão do SaaS)
 * Separado dos usuários normais dos tenants
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AdminRole = 'super_admin' | 'support' | 'billing';
export type AdminStatus = 'active' | 'inactive';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  password_hash!: string;

  @Column({ type: 'enum', enum: ['super_admin', 'support', 'billing'], default: 'support' })
  role!: AdminRole;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status!: AdminStatus;

  @Column({ type: 'datetime', nullable: true, name: 'last_login_at' })
  last_login_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
