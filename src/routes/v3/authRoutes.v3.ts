/**
 * Auth Routes v3 - Multi-tenant
 * Retorna token com tenantSlug
 */

import { Router } from 'express';
import { loginController, registerUserController } from '../../controller/authController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';

const router = Router();

router.post('/login', loginController);
router.post('/register', authMiddleware, tenantMiddleware, registerUserController);

export default router;
