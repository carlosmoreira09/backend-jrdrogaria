/**
 * Quotation Routes v3 - Multi-tenant
 * Requer headers X-Tenant-Slug e X-Store-Id
 */

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
  exportBestPricesController,
} from '../../controller/quotationController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { resolveStore } from '../../middleware/storeMiddleware';
import {
  validateQuotationCreate,
  validateQuotationUpdate,
  validateGenerateLinks,
  validateIdParam,
} from '../../middlewares/validators';

const router = Router();

// v3 Multi-tenant Routes - requer tenant + store
router.post('/', authMiddleware, tenantMiddleware, resolveStore, validateQuotationCreate, createQuotationController);
router.get('/', authMiddleware, tenantMiddleware, resolveStore, listQuotationsController);
router.get('/:id', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, getQuotationDetailController);
router.put('/:id', authMiddleware, tenantMiddleware, resolveStore, validateQuotationUpdate, updateQuotationController);
router.delete('/:id', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, deleteQuotationController);
router.post('/:id/generate-links', authMiddleware, tenantMiddleware, resolveStore, validateGenerateLinks, generateSupplierLinksController);
router.get('/:id/comparison', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, getPriceComparisonController);
router.get('/:id/best-prices', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, getBestPricesController);
router.get('/:id/export', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, exportComparisonController);
router.get('/:id/export-orders', authMiddleware, tenantMiddleware, resolveStore, validateIdParam, exportBestPricesController);

export default router;
