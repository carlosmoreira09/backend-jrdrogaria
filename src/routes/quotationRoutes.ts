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
} from '../controller/quotationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  validateQuotationCreate,
  validateQuotationUpdate,
  validateGenerateLinks,
  validateIdParam,
} from '../middlewares/validators';

const router = Router();

router.post('/', authMiddleware, validateQuotationCreate, createQuotationController);
router.get('/', authMiddleware, listQuotationsController);
router.get('/:id', authMiddleware, validateIdParam, getQuotationDetailController);
router.put('/:id', authMiddleware, validateQuotationUpdate, updateQuotationController);
router.delete('/:id', authMiddleware, validateIdParam, deleteQuotationController);
router.post('/:id/generate-links', authMiddleware, validateGenerateLinks, generateSupplierLinksController);
router.get('/:id/comparison', authMiddleware, validateIdParam, getPriceComparisonController);
router.get('/:id/best-prices', authMiddleware, validateIdParam, getBestPricesController);
router.get('/:id/export', authMiddleware, validateIdParam, exportComparisonController);
router.get('/:id/export-orders', authMiddleware, validateIdParam, exportBestPricesController);

export default router;
