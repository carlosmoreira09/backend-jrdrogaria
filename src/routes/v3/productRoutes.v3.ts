/**
 * Product Routes v3 - Multi-tenant
 * Requer headers X-Tenant-Slug
 */

import { Router } from 'express';
import {
  createProductController,
  deleteProductController,
  listProductsController,
  updateProductController,
} from '../../controller/productController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';

const router = Router();

// v3 Multi-tenant Routes - requer tenant
router.get('/', authMiddleware, tenantMiddleware, listProductsController);
router.post('/', authMiddleware, tenantMiddleware, createProductController);
router.put('/:id', authMiddleware, tenantMiddleware, updateProductController);
router.delete('/:id', authMiddleware, tenantMiddleware, deleteProductController);

export default router;
