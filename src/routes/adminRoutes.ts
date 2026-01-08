/**
 * Admin Routes - API para gestão do SaaS
 * Base URL: /admin/v1
 */

import { Router } from 'express';
import {
  adminLoginController,
  createAdminUserController,
  listAdminUsersController,
  getDashboardController,
  listTenantsController,
  getTenantDetailsController,
  updateTenantStatusController,
  updateTenantPlanController,
  createTenantController,
  getAuditLogsController,
  healthCheckController,
} from '../controller/adminController';
import { adminAuthMiddleware, requireAdminRole } from '../middleware/adminAuthMiddleware';

const router = Router();

router.get('/health', healthCheckController);

router.post('/auth/login', adminLoginController);

router.use(adminAuthMiddleware);

router.get('/dashboard', getDashboardController);
router.get('/dashboard/stats', getDashboardController);

router.get('/tenants', listTenantsController);
router.post('/tenants', requireAdminRole(['super_admin']), createTenantController);
router.get('/tenants/:id', getTenantDetailsController);
router.put('/tenants/:id/status', requireAdminRole(['super_admin', 'support']), updateTenantStatusController);
router.put('/tenants/:id/plan', requireAdminRole(['super_admin', 'billing']), updateTenantPlanController);

router.get('/admin-users', requireAdminRole(['super_admin']), listAdminUsersController);
router.post('/admin-users', requireAdminRole(['super_admin']), createAdminUserController);

router.get('/audit-logs', getAuditLogsController);

export default router;
