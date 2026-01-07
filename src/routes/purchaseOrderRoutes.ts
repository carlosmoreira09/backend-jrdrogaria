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
} from '../controller/purchaseOrderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { validateOrderCreate, validateOrderStatus, validateIdParam } from '../middlewares/validators';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validators';

const validateQuotationIdParam = [
  param('quotationId').isInt({ min: 1 }).withMessage('ID da cotação inválido'),
  handleValidationErrors,
];

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, listPurchaseOrdersController);
router.get('/:id', authMiddleware, tenantMiddleware, validateIdParam, getPurchaseOrderDetailController);
router.post('/', authMiddleware, tenantMiddleware, validateOrderCreate, createPurchaseOrderController);
router.post('/generate/:quotationId', authMiddleware, tenantMiddleware, validateQuotationIdParam, generateOrdersController);
router.put('/:id/items', authMiddleware, tenantMiddleware, validateIdParam, updatePurchaseOrderItemsController);
router.put('/:id/status', authMiddleware, tenantMiddleware, validateOrderStatus, updatePurchaseOrderStatusController);
router.delete('/:id', authMiddleware, tenantMiddleware, validateIdParam, deletePurchaseOrderController);
router.get('/:id/export', authMiddleware, tenantMiddleware, validateIdParam, exportPurchaseOrderController);

export default router;
