import { Router } from 'express';
import { 
  getPublicQuotationController, 
  savePublicPricesController,
  getQuotationForAnonymousController,
  saveAnonymousSupplierPricesController,
} from '../controller/publicQuotationController';
import { publicRateLimiter, submitRateLimiter } from '../middlewares/rateLimitMiddleware';
import { validatePublicPrices } from '../middlewares/validators';

const router = Router();

// Existing routes for registered suppliers
router.get('/quotation/:token', publicRateLimiter, getPublicQuotationController);
router.post('/quotation/:token/prices', submitRateLimiter, validatePublicPrices, savePublicPricesController);

// Routes for anonymous suppliers (using public_token)
router.get('/quotation-open/:token', publicRateLimiter, getQuotationForAnonymousController);
router.post('/quotation-open/:token/submit', submitRateLimiter, saveAnonymousSupplierPricesController);

export default router;
