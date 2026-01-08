/**
 * Subscription - Billing e planos
 * Vinculado ao Tenant
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './Tenant';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'enum', enum: ['free', 'pro', 'enterprise'], default: 'free' })
  plan!: SubscriptionPlan;

  @Column({ type: 'enum', enum: ['active', 'past_due', 'cancelled', 'trialing'], default: 'trialing' })
  status!: SubscriptionStatus;

  @Column({ type: 'datetime', nullable: true, name: 'current_period_start' })
  current_period_start?: Date;

  @Column({ type: 'datetime', nullable: true, name: 'current_period_end' })
  current_period_end?: Date;

  @Column({ nullable: true, name: 'stripe_customer_id' })
  stripe_customer_id?: string;

  @Column({ nullable: true, name: 'stripe_subscription_id' })
  stripe_subscription_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
