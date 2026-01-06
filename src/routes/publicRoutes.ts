import { Router } from 'express';
import { getPublicQuotationController, savePublicPricesController } from '../controller/publicQuotationController';

const router = Router();

router.get('/quotation/:token', getPublicQuotationController);
router.post('/quotation/:token/prices', savePublicPricesController);

export default router;
