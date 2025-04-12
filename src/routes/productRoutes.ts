import { Router } from 'express';
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {
    createMultipleProductController,
    createProductController, deleteProductController, getProductDetailsController,
    listProductsController,
    updateProductController
} from "../controller/productController";
import {authMiddleware} from "../middlewares/authMiddleware";


const router = Router();

router.post('/', authMiddleware, tenantMiddleware, createProductController)
router.post('/multiple', authMiddleware, tenantMiddleware, createMultipleProductController)
router.get('/', authMiddleware,tenantMiddleware, listProductsController)
router.put('/', authMiddleware,tenantMiddleware, updateProductController)
router.delete('/:id', authMiddleware,tenantMiddleware, deleteProductController)
router.get('/:id', authMiddleware,tenantMiddleware, getProductDetailsController)

export default router;