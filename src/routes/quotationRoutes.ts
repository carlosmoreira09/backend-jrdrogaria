/**
 * Quotation Routes v1 - Legacy (retrocompatível)
 * Não requer headers X-Tenant-Slug ou X-Store-Id
 */

import { Router } from 'express';
import {
  createQuotationControllerLegacy,
  deleteQuotationControllerLegacy,
  generateSupplierLinksControllerLegacy,
  getQuotationDetailControllerLegacy,
  listQuotationsControllerLegacy,
  updateQuotationControllerLegacy,
  getPriceComparisonControllerLegacy,
  getBestPricesControllerLegacy,
  exportComparisonControllerLegacy,
  exportBestPricesControllerLegacy,
} from '../controller/legacy/quotationController.legacy';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  validateQuotationCreate,
  validateQuotationUpdate,
  validateGenerateLinks,
  validateIdParam,
} from '../middlewares/validators';

const router = Router();

// v1 Legacy Routes - sem multi-tenant
router.post('/', authMiddleware, validateQuotationCreate, createQuotationControllerLegacy);
router.get('/', authMiddleware, listQuotationsControllerLegacy);
router.get('/:id', authMiddleware, validateIdParam, getQuotationDetailControllerLegacy);
router.put('/:id', authMiddleware, validateQuotationUpdate, updateQuotationControllerLegacy);
router.delete('/:id', authMiddleware, validateIdParam, deleteQuotationControllerLegacy);
router.post('/:id/generate-links', authMiddleware, validateGenerateLinks, generateSupplierLinksControllerLegacy);
router.get('/:id/comparison', authMiddleware, validateIdParam, getPriceComparisonControllerLegacy);
router.get('/:id/best-prices', authMiddleware, validateIdParam, getBestPricesControllerLegacy);
router.get('/:id/export', authMiddleware, validateIdParam, exportComparisonControllerLegacy);
router.get('/:id/export-orders', authMiddleware, validateIdParam, exportBestPricesControllerLegacy);

export default router;
