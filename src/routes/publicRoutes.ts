/**
 * Public Routes v1 - Legacy (retrocompatível)
 * Para links públicos de fornecedores
 */

import { Router } from 'express';
import { 
  getQuotationByTokenControllerLegacy, 
  savePricesControllerLegacy,
  submitPublicQuotationControllerLegacy,
  getOpenQuotationControllerLegacy,
  submitOpenQuotationControllerLegacy,
} from '../controller/legacy/publicController.legacy';
import { publicRateLimiter, submitRateLimiter } from '../middlewares/rateLimitMiddleware';
import { validatePublicPrices } from '../middlewares/validators';

const router = Router();

// v1 Legacy Routes - para fornecedores
router.get('/quotation/:token', publicRateLimiter, getQuotationByTokenControllerLegacy);
router.post('/quotation/:token/prices', submitRateLimiter, validatePublicPrices, savePricesControllerLegacy);

// Routes for anonymous suppliers
router.post('/quotation/:token/submit', submitRateLimiter, submitPublicQuotationControllerLegacy);

// Open quotation routes (any supplier can access by quotation ID)
router.get('/quotation-open/:id', publicRateLimiter, getOpenQuotationControllerLegacy);
router.post('/quotation-open/:id/submit', submitRateLimiter, submitOpenQuotationControllerLegacy);

export default router;
