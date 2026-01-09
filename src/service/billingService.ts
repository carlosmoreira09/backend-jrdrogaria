/**
 * Billing Service - Integração Stripe e controle de planos
 */

import { AppDataSource } from '../config/database';
import { Subscription, SubscriptionPlan, SubscriptionStatus } from '../entity/Subscription';

export { SubscriptionPlan, SubscriptionStatus };
import { Tenant } from '../entity/Tenant';
import { Store } from '../entity/Store';
import { Users } from '../entity/Users';
import { Supplier } from '../entity/Supplier';
import { Products } from '../entity/Products';
import { QuotationRequest } from '../entity/QuotationRequest';

const getSubscriptionRepository = () => AppDataSource.getRepository(Subscription);
const getTenantRepository = () => AppDataSource.getRepository(Tenant);
const getStoreRepository = () => AppDataSource.getRepository(Store);
const getUserRepository = () => AppDataSource.getRepository(Users);
const getSupplierRepository = () => AppDataSource.getRepository(Supplier);
const getProductRepository = () => AppDataSource.getRepository(Products);
const getQuotationRepository = () => AppDataSource.getRepository(QuotationRequest);

export interface PlanLimits {
  stores: number;
  users: number;
  quotationsPerMonth: number;
  suppliers: number;
  products: number;
  historyDays: number;
  whatsappEnabled: boolean;
  apiEnabled: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    stores: 1,
    users: 2,
    quotationsPerMonth: 10,
    suppliers: 5,
    products: 100,
    historyDays: 30,
    whatsappEnabled: false,
    apiEnabled: false,
  },
  pro: {
    stores: 5,
    users: 10,
    quotationsPerMonth: 100,
    suppliers: 50,
    products: 1000,
    historyDays: 365,
    whatsappEnabled: true,
    apiEnabled: false,
  },
  enterprise: {
    stores: Infinity,
    users: Infinity,
    quotationsPerMonth: Infinity,
    suppliers: Infinity,
    products: Infinity,
    historyDays: Infinity,
    whatsappEnabled: true,
    apiEnabled: true,
  },
};

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free: 0,
  pro: 19900, // centavos = R$ 199,00
  enterprise: 49900, // centavos = R$ 499,00
};

export const getOrCreateSubscription = async (tenantId: number): Promise<Subscription> => {
  const subscriptionRepository = getSubscriptionRepository();
  const tenantRepository = getTenantRepository();

  let subscription = await subscriptionRepository.findOne({
    where: { tenant: { id: tenantId } },
    relations: ['tenant'],
  });

  if (!subscription) {
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    subscription = subscriptionRepository.create({
      tenant,
      plan: (tenant.plan as SubscriptionPlan) || 'free',
      status: 'trialing',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });
    await subscriptionRepository.save(subscription);
  }

  return subscription;
};

export const getPlanLimits = (plan: SubscriptionPlan): PlanLimits => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

export const getTenantUsage = async (tenantId: number) => {
  const storeRepository = getStoreRepository();
  const userRepository = getUserRepository();
  const supplierRepository = getSupplierRepository();
  const productRepository = getProductRepository();
  const quotationRepository = getQuotationRepository();

  const [storesCount, usersCount, suppliersCount, productsCount] = await Promise.all([
    storeRepository.count({ where: { tenant: { id: tenantId } } }),
    userRepository.count({ where: { tenant: { id: tenantId } } }),
    supplierRepository.count({ where: { tenant: { id: tenantId } } }),
    productRepository.count({ where: { tenant: { id: tenantId } } }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const quotationsThisMonth = await quotationRepository
    .createQueryBuilder('q')
    .where('q.tenant_id = :tenantId', { tenantId })
    .andWhere('q.created_at >= :startOfMonth', { startOfMonth })
    .getCount();

  return {
    stores: storesCount,
    users: usersCount,
    suppliers: suppliersCount,
    products: productsCount,
    quotationsThisMonth,
  };
};

export type ResourceType = 'stores' | 'users' | 'suppliers' | 'products' | 'quotations';

export const checkPlanLimit = async (
  tenantId: number,
  resource: ResourceType
): Promise<{ allowed: boolean; current: number; limit: number; plan: SubscriptionPlan }> => {
  const subscription = await getOrCreateSubscription(tenantId);
  const limits = getPlanLimits(subscription.plan);
  const usage = await getTenantUsage(tenantId);

  let current: number;
  let limit: number;

  switch (resource) {
    case 'stores':
      current = usage.stores;
      limit = limits.stores;
      break;
    case 'users':
      current = usage.users;
      limit = limits.users;
      break;
    case 'suppliers':
      current = usage.suppliers;
      limit = limits.suppliers;
      break;
    case 'products':
      current = usage.products;
      limit = limits.products;
      break;
    case 'quotations':
      current = usage.quotationsThisMonth;
      limit = limits.quotationsPerMonth;
      break;
    default:
      current = 0;
      limit = Infinity;
  }

  return {
    allowed: current < limit,
    current,
    limit,
    plan: subscription.plan,
  };
};

export const getSubscriptionDetails = async (tenantId: number) => {
  const subscription = await getOrCreateSubscription(tenantId);
  const limits = getPlanLimits(subscription.plan);
  const usage = await getTenantUsage(tenantId);

  return {
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      stripe_customer_id: subscription.stripe_customer_id,
    },
    limits,
    usage,
    price: PLAN_PRICES[subscription.plan],
  };
};

export const updateSubscriptionPlan = async (
  tenantId: number,
  newPlan: SubscriptionPlan
): Promise<Subscription> => {
  const subscriptionRepository = getSubscriptionRepository();
  const tenantRepository = getTenantRepository();
  
  const subscription = await getOrCreateSubscription(tenantId);
  const tenant = await tenantRepository.findOne({ where: { id: tenantId } });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  subscription.plan = newPlan;
  subscription.status = 'active';
  subscription.current_period_start = new Date();
  subscription.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  tenant.plan = newPlan;

  await Promise.all([
    subscriptionRepository.save(subscription),
    tenantRepository.save(tenant),
  ]);

  return subscription;
};

export const cancelSubscription = async (tenantId: number): Promise<Subscription> => {
  const subscriptionRepository = getSubscriptionRepository();
  const subscription = await getOrCreateSubscription(tenantId);

  subscription.status = 'cancelled';
  await subscriptionRepository.save(subscription);

  return subscription;
};
