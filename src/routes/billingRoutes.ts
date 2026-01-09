/**
 * Billing Routes - Rotas de billing e planos
 * Base URL: /api/v3/billing
 */

import { Router } from 'express';
import {
  getSubscriptionController,
  getPlansController,
  upgradeSubscriptionController,
} from '../controller/billingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/subscription', getSubscriptionController);
router.get('/plans', getPlansController);
router.post('/upgrade', upgradeSubscriptionController);

export default router;
