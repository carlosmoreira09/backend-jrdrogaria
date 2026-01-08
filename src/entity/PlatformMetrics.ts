/**
 * PlatformMetrics - Métricas da plataforma (dashboard admin)
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('platform_metrics')
@Index(['metric_date'])
export class PlatformMetrics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date', name: 'metric_date' })
  metric_date!: Date;

  @Column({ type: 'int', default: 0, name: 'total_tenants' })
  total_tenants!: number;

  @Column({ type: 'int', default: 0, name: 'active_tenants' })
  active_tenants!: number;

  @Column({ type: 'int', default: 0, name: 'trial_tenants' })
  trial_tenants!: number;

  @Column({ type: 'int', default: 0, name: 'total_users' })
  total_users!: number;

  @Column({ type: 'int', default: 0, name: 'total_quotations' })
  total_quotations!: number;

  @Column({ type: 'int', default: 0, name: 'quotations_today' })
  quotations_today!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mrr!: number;

  @Column({ type: 'json', nullable: true, name: 'plans_breakdown' })
  plans_breakdown?: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
