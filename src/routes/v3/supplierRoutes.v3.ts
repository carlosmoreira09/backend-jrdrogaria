/**
 * Supplier Routes v3 - Multi-tenant
 * Requer headers X-Tenant-Slug
 */

import { Router } from 'express';
import {
  createSupplierController,
  deleteSupplierController,
  listSupplierController,
  updateSupplierController,
} from '../../controller/supplierController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';

const router = Router();

// v3 Multi-tenant Routes - requer tenant
router.get('/', authMiddleware, tenantMiddleware, listSupplierController);
router.post('/', authMiddleware, tenantMiddleware, createSupplierController);
router.put('/:id', authMiddleware, tenantMiddleware, updateSupplierController);
router.delete('/:id', authMiddleware, tenantMiddleware, deleteSupplierController);

export default router;
