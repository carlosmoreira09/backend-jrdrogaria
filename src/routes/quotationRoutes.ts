import { Router } from 'express';
import {
  createQuotationController,
  deleteQuotationController,
  generateSupplierLinksController,
  getQuotationDetailController,
  listQuotationsController,
  updateQuotationController,
  getPriceComparisonController,
  getBestPricesController,
  exportComparisonController,
} from '../controller/quotationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import {
  validateQuotationCreate,
  validateQuotationUpdate,
  validateGenerateLinks,
  validateIdParam,
} from '../middlewares/validators';

const router = Router();

router.post('/', authMiddleware, tenantMiddleware, validateQuotationCreate, createQuotationController);
router.get('/', authMiddleware, tenantMiddleware, listQuotationsController);
router.get('/:id', authMiddleware, tenantMiddleware, validateIdParam, getQuotationDetailController);
router.put('/:id', authMiddleware, tenantMiddleware, validateQuotationUpdate, updateQuotationController);
router.delete('/:id', authMiddleware, tenantMiddleware, validateIdParam, deleteQuotationController);
router.post('/:id/generate-links', authMiddleware, tenantMiddleware, validateGenerateLinks, generateSupplierLinksController);
router.get('/:id/comparison', authMiddleware, tenantMiddleware, validateIdParam, getPriceComparisonController);
router.get('/:id/best-prices', authMiddleware, tenantMiddleware, validateIdParam, getBestPricesController);
router.get('/:id/export', authMiddleware, tenantMiddleware, validateIdParam, exportComparisonController);

export default router;
