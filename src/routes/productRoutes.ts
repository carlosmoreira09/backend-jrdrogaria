import { Router } from 'express';
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {
    createProductController, deleteProductController, getProductDetailsController,
    listProductsController,
    updateProductController
} from "../controller/productController";


const router = Router();

router.post('/', tenantMiddleware, createProductController)
router.get('/', tenantMiddleware, listProductsController)
router.put('/', tenantMiddleware, updateProductController)
router.delete('/:id', tenantMiddleware, deleteProductController)
router.get('/:id', tenantMiddleware, getProductDetailsController)

export default router;