/**
 * Purchase Order Routes v1 - Legacy (retrocompatível)
 * Não requer headers X-Tenant-Slug ou X-Store-Id
 */

import { Router } from 'express';
import {
  createOrderControllerLegacy,
  exportOrderControllerLegacy,
  generateOrdersControllerLegacy,
  getOrderDetailControllerLegacy,
  listOrdersControllerLegacy,
  updateOrderItemsControllerLegacy,
  updateOrderStatusControllerLegacy,
} from '../controller/legacy/purchaseOrderController.legacy';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateOrderCreate, validateOrderStatus, validateIdParam } from '../middlewares/validators';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validators';

const validateQuotationIdParam = [
  param('quotationId').isInt({ min: 1 }).withMessage('ID da cotação inválido'),
  handleValidationErrors,
];

const router = Router();

// v1 Legacy Routes - sem multi-tenant
router.get('/', authMiddleware, listOrdersControllerLegacy);
router.get('/:id', authMiddleware, validateIdParam, getOrderDetailControllerLegacy);
router.post('/', authMiddleware, validateOrderCreate, createOrderControllerLegacy);
router.post('/generate/:quotationId', authMiddleware, validateQuotationIdParam, generateOrdersControllerLegacy);
router.put('/:id/items', authMiddleware, validateIdParam, updateOrderItemsControllerLegacy);
router.put('/:id/status', authMiddleware, validateOrderStatus, updateOrderStatusControllerLegacy);
router.get('/:id/export', authMiddleware, validateIdParam, exportOrderControllerLegacy);

export default router;
