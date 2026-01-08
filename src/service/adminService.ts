/**
 * Admin Service - Gestão do SaaS
 * Funcionalidades para super admins
 */

import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entity/AdminUser';
import { AdminAuditLog } from '../entity/AdminAuditLog';
import { Tenant } from '../entity/Tenant';
import { Store } from '../entity/Store';
import { Users } from '../entity/Users';
import { QuotationRequest } from '../entity/QuotationRequest';
import { generateAdminToken } from '../middleware/adminAuthMiddleware';

const getAdminUserRepository = () => AppDataSource.getRepository(AdminUser);
const getAdminAuditLogRepository = () => AppDataSource.getRepository(AdminAuditLog);
const getTenantRepository = () => AppDataSource.getRepository(Tenant);
const getStoreRepository = () => AppDataSource.getRepository(Store);
const getUserRepository = () => AppDataSource.getRepository(Users);
const getQuotationRepository = () => AppDataSource.getRepository(QuotationRequest);

export const adminLoginService = async (email: string, password: string) => {
  const adminUserRepository = getAdminUserRepository();
  const admin = await adminUserRepository.findOne({
    where: { email, status: 'active' },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  const isValidPassword = await bcrypt.compare(password, admin.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  admin.last_login_at = new Date();
  await adminUserRepository.save(admin);

  const token = generateAdminToken(admin);

  return { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } };
};

export const createAdminUserService = async (
  data: { name: string; email: string; password: string; role: 'super_admin' | 'support' | 'billing' },
  createdBy: AdminUser
) => {
  const adminUserRepository = getAdminUserRepository();
  const existingAdmin = await adminUserRepository.findOne({ where: { email: data.email } });
  if (existingAdmin) {
    throw new Error('Email already exists');
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const admin = adminUserRepository.create({
    name: data.name,
    email: data.email,
    password_hash,
    role: data.role,
    status: 'active',
  });

  const savedAdmin = await adminUserRepository.save(admin);

  await logAdminAction(createdBy, 'admin.create', { admin_id: savedAdmin.id, email: data.email });

  return savedAdmin;
};

export const listAdminUsersService = async () => {
  const adminUserRepository = getAdminUserRepository();
  return adminUserRepository.find({
    select: ['id', 'name', 'email', 'role', 'status', 'last_login_at', 'created_at'],
    order: { created_at: 'DESC' },
  });
};

export const getDashboardStatsService = async () => {
  const tenantRepository = getTenantRepository();
  const userRepository = getUserRepository();
  const quotationRepository = getQuotationRepository();

  const [totalTenants, activeTenants, trialTenants] = await Promise.all([
    tenantRepository.count(),
    tenantRepository.count({ where: { status: 'active' } }),
    tenantRepository.count({ where: { status: 'trial' } }),
  ]);

  const totalUsers = await userRepository.count();
  const totalQuotations = await quotationRepository.count();

  const planBreakdown = await tenantRepository
    .createQueryBuilder('t')
    .select('t.plan', 'plan')
    .addSelect('COUNT(*)', 'count')
    .groupBy('t.plan')
    .getRawMany();

  return {
    totalTenants,
    activeTenants,
    trialTenants,
    totalUsers,
    totalQuotations,
    planBreakdown: planBreakdown.reduce((acc, curr) => {
      acc[curr.plan] = parseInt(curr.count);
      return acc;
    }, {} as Record<string, number>),
  };
};

export const listTenantsService = async (filters?: {
  status?: string;
  plan?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const tenantRepository = getTenantRepository();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const query = tenantRepository.createQueryBuilder('t')
    .leftJoinAndSelect('t.stores', 'stores')
    .leftJoinAndSelect('t.users', 'users');

  if (filters?.status) {
    query.andWhere('t.status = :status', { status: filters.status });
  }

  if (filters?.plan) {
    query.andWhere('t.plan = :plan', { plan: filters.plan });
  }

  if (filters?.search) {
    query.andWhere('(t.name LIKE :search OR t.slug LIKE :search)', { search: `%${filters.search}%` });
  }

  const [tenants, total] = await query
    .orderBy('t.created_at', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: tenants.map(t => ({
      ...t,
      storesCount: t.stores?.length || 0,
      usersCount: t.users?.length || 0,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getTenantDetailsService = async (tenantId: number) => {
  const tenantRepository = getTenantRepository();
  const quotationRepository = getQuotationRepository();
  const tenant = await tenantRepository.findOne({
    where: { id: tenantId },
    relations: ['stores', 'users'],
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const quotationCount = await quotationRepository.count({
    where: { tenant: { id: tenantId } },
  });

  return {
    ...tenant,
    storesCount: tenant.stores?.length || 0,
    usersCount: tenant.users?.length || 0,
    quotationCount,
  };
};

export const updateTenantStatusService = async (
  tenantId: number,
  status: 'active' | 'suspended' | 'trial' | 'cancelled',
  admin: AdminUser,
  reason?: string
) => {
  const tenantRepository = getTenantRepository();
  const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const oldStatus = tenant.status;
  tenant.status = status;
  await tenantRepository.save(tenant);

  await logAdminAction(admin, 'tenant.status_change', {
    tenant_id: tenantId,
    old_status: oldStatus,
    new_status: status,
    reason,
  });

  return tenant;
};

export const updateTenantPlanService = async (
  tenantId: number,
  plan: 'free' | 'pro' | 'enterprise',
  admin: AdminUser,
  reason?: string
) => {
  const tenantRepository = getTenantRepository();
  const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const oldPlan = tenant.plan;
  tenant.plan = plan;
  await tenantRepository.save(tenant);

  await logAdminAction(admin, 'tenant.plan_change', {
    tenant_id: tenantId,
    old_plan: oldPlan,
    new_plan: plan,
    reason,
  });

  return tenant;
};

export const createTenantService = async (
  data: {
    name: string;
    slug: string;
    plan: 'free' | 'pro' | 'enterprise';
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    storeName: string;
    storeCode?: string;
  },
  admin: AdminUser
) => {
  return AppDataSource.transaction(async (manager) => {
    const tenantRepo = manager.getRepository(Tenant);
    const storeRepo = manager.getRepository(Store);
    const userRepo = manager.getRepository(Users);

    const existingTenant = await tenantRepo.findOne({ where: { slug: data.slug } });
    if (existingTenant) {
      throw new Error('Slug already exists');
    }

    const tenant = tenantRepo.create({
      name: data.name,
      slug: data.slug,
      status: 'trial',
      plan: data.plan,
    });
    const savedTenant = await tenantRepo.save(tenant);

    const store = storeRepo.create({
      tenant: savedTenant,
      name: data.storeName,
      code: data.storeCode,
      status: 'active',
    });
    await storeRepo.save(store);

    const password_hash = await bcrypt.hash(data.ownerPassword, 10);
    const owner = userRepo.create({
      tenant: savedTenant,
      fullName: data.ownerName,
      email: data.ownerEmail,
      password: password_hash,
      role: 'tenant_owner',
      status: 'active',
    });
    await userRepo.save(owner);

    await logAdminAction(admin, 'tenant.create', {
      tenant_id: savedTenant.id,
      name: data.name,
      slug: data.slug,
      plan: data.plan,
    });

    return savedTenant;
  });
};

export const getAuditLogsService = async (filters?: {
  adminId?: number;
  tenantId?: number;
  action?: string;
  page?: number;
  limit?: number;
}) => {
  const adminAuditLogRepository = getAdminAuditLogRepository();
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const skip = (page - 1) * limit;

  const query = adminAuditLogRepository.createQueryBuilder('log')
    .leftJoinAndSelect('log.admin_user', 'admin')
    .leftJoinAndSelect('log.tenant', 'tenant');

  if (filters?.adminId) {
    query.andWhere('log.admin_user_id = :adminId', { adminId: filters.adminId });
  }

  if (filters?.tenantId) {
    query.andWhere('log.tenant_id = :tenantId', { tenantId: filters.tenantId });
  }

  if (filters?.action) {
    query.andWhere('log.action LIKE :action', { action: `%${filters.action}%` });
  }

  const [logs, total] = await query
    .orderBy('log.created_at', 'DESC')
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

async function logAdminAction(
  admin: AdminUser,
  action: string,
  details?: Record<string, any>,
  tenant?: Tenant
) {
  const adminAuditLogRepository = getAdminAuditLogRepository();
  const log = adminAuditLogRepository.create({
    admin_user: admin,
    action,
    details,
    tenant,
  });
  await adminAuditLogRepository.save(log);
}
