import { Router } from 'express';
import { getPublicQuotationController, savePublicPricesController } from '../controller/publicQuotationController';
import { publicRateLimiter, submitRateLimiter } from '../middlewares/rateLimitMiddleware';
import { validatePublicPrices } from '../middlewares/validators';

const router = Router();

router.get('/quotation/:token', publicRateLimiter, getPublicQuotationController);
router.post('/quotation/:token/prices', submitRateLimiter, validatePublicPrices, savePublicPricesController);

export default router;
