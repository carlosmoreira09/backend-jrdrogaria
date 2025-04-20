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

router.post('/', authMiddleware, createProductController)
router.post('/multiple', authMiddleware, createMultipleProductController)
router.get('/', authMiddleware, listProductsController)
router.put('/', authMiddleware, updateProductController)
router.delete('/:id', authMiddleware, deleteProductController)
router.get('/:id', authMiddleware, getProductDetailsController)

export default router;