/**
 * Admin Controller - Endpoints para gestão do SaaS
 */

import { Request, Response } from 'express';
import {
  adminLoginService,
  createAdminUserService,
  listAdminUsersService,
  getDashboardStatsService,
  listTenantsService,
  getTenantDetailsService,
  updateTenantStatusService,
  updateTenantPlanService,
  createTenantService,
  getAuditLogsService,
} from '../service/adminService';

export const adminLoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await adminLoginService(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Login failed' });
  }
};

export const createAdminUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const admin = await createAdminUserService({ name, email, password, role }, req.admin);
    res.status(201).json({ data: admin, message: 'Admin created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listAdminUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await listAdminUsersService();
    res.status(200).json({ data: admins });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardController = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getDashboardStatsService();
    res.status(200).json({ data: stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listTenantsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, plan, search, page, limit } = req.query;
    const result = await listTenantsService({
      status: status as string,
      plan: plan as string,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTenantDetailsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = parseInt(req.params.id);
    const tenant = await getTenantDetailsService(tenantId);
    res.status(200).json({ data: tenant });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateTenantStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }

    const tenantId = parseInt(req.params.id);
    const { status, reason } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const tenant = await updateTenantStatusService(tenantId, status, req.admin, reason);
    res.status(200).json({ data: tenant, message: 'Status updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTenantPlanController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }

    const tenantId = parseInt(req.params.id);
    const { plan, reason } = req.body;

    if (!plan) {
      res.status(400).json({ error: 'Plan is required' });
      return;
    }

    const tenant = await updateTenantPlanService(tenantId, plan, req.admin, reason);
    res.status(200).json({ data: tenant, message: 'Plan updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createTenantController = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ error: 'Admin authentication required' });
      return;
    }

    const { name, slug, plan, ownerName, ownerEmail, ownerPassword, storeName, storeCode } = req.body;

    if (!name || !slug || !plan || !ownerName || !ownerEmail || !ownerPassword || !storeName) {
      res.status(400).json({ error: 'All required fields must be provided' });
      return;
    }

    const tenant = await createTenantService(
      { name, slug, plan, ownerName, ownerEmail, ownerPassword, storeName, storeCode },
      req.admin
    );
    res.status(201).json({ data: tenant, message: 'Tenant created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAuditLogsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminId, tenantId, action, page, limit } = req.query;
    const result = await getAuditLogsService({
      adminId: adminId ? parseInt(adminId as string) : undefined,
      tenantId: tenantId ? parseInt(tenantId as string) : undefined,
      action: action as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const healthCheckController = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ status: 'ok', service: 'admin-api', timestamp: new Date().toISOString() });
};
