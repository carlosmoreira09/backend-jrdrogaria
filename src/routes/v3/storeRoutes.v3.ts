/**
 * Store Routes v3 - Multi-tenant
 * Requer header X-Tenant-Slug
 */

import { Router } from 'express';
import { listStoresController, getStoreController } from '../../controller/storeController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { validateIdParam } from '../../middlewares/validators';

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, listStoresController);
router.get('/:id', authMiddleware, tenantMiddleware, validateIdParam, getStoreController);

export default router;
