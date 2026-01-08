/**
 * Purchase Order Routes v3 - Multi-tenant
 * Requer headers X-Tenant-Slug e X-Store-Id
 */

import { Router } from 'express';
import {
  createPurchaseOrderController,
  deletePurchaseOrderController,
  exportPurchaseOrderController,
  generateOrdersController,
  getPurchaseOrderDetailController,
  listPurchaseOrdersController,
  updatePurchaseOrderItemsController,
  updatePurchaseOrderStatusController,
} from '../../controller/purchaseOrderController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { resolveStore } from '../../middleware/storeMiddleware';
import { validateOrderCreate, validateOrderStatus, validateIdParam } from '../../middlewares/validators';
import { param } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/validators';

const validateQuotationIdParam = [
  param('quotationId').isInt({ min: 1 }).withMessage('ID da cotação inválido'),
  handleValidationErrors,
];

const router = Router();

// v3 Multi-tenant Routes - requer tenant + store
router.get('/', authMiddleware, tenantMiddleware, resolveStore, listPurchaseOrdersController);
router.get('/:id', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, getPurchaseOrderDetailController);
router.post('/', authMiddleware, tenantMiddleware, resolveStore, validateOrderCreate, createPurchaseOrderController);
router.post('/generate/:quotationId', authMiddleware, tenantMiddleware, resolveStore, validateQuotationIdParam, generateOrdersController);
router.put('/:id/items', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, updatePurchaseOrderItemsController);
router.put('/:id/status', authMiddleware, tenantMiddleware, resolveStore, validateOrderStatus, updatePurchaseOrderStatusController);
router.delete('/:id', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, deletePurchaseOrderController);
router.get('/:id/export', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, exportPurchaseOrderController);

export default router;
