/**
 * Public Routes v1 - Legacy (retrocompatível)
 * Para links públicos de fornecedores
 */

import { Router } from 'express';
import { 
  getQuotationByTokenControllerLegacy, 
  savePricesControllerLegacy,
  submitPublicQuotationControllerLegacy,
} from '../controller/legacy/publicController.legacy';
import { publicRateLimiter, submitRateLimiter } from '../middlewares/rateLimitMiddleware';
import { validatePublicPrices } from '../middlewares/validators';

const router = Router();

// v1 Legacy Routes - para fornecedores
router.get('/quotation/:token', publicRateLimiter, getQuotationByTokenControllerLegacy);
router.post('/quotation/:token/prices', submitRateLimiter, validatePublicPrices, savePricesControllerLegacy);

// Routes for anonymous suppliers
router.post('/quotation/:token/submit', submitRateLimiter, submitPublicQuotationControllerLegacy);

export default router;
