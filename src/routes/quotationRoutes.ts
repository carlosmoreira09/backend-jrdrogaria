import { Router } from 'express';
import {
  createQuotationController,
  deleteQuotationController,
  generateSupplierLinksController,
  getQuotationDetailController,
  listQuotationsController,
  updateQuotationController,
} from '../controller/quotationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';

const router = Router();

router.post('/', authMiddleware, tenantMiddleware, createQuotationController);
router.get('/', authMiddleware, tenantMiddleware, listQuotationsController);
router.get('/:id', authMiddleware, tenantMiddleware, getQuotationDetailController);
router.put('/:id', authMiddleware, tenantMiddleware, updateQuotationController);
router.delete('/:id', authMiddleware, tenantMiddleware, deleteQuotationController);
router.post('/:id/generate-links', authMiddleware, tenantMiddleware, generateSupplierLinksController);

export default router;
