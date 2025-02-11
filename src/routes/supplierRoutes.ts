import { Router } from 'express';
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {
    createSupplierController,
    deleteSupplierController,
    getSupplierDetailsController,
    listSupplierController,
    updateSupplierController
} from "../controller/supplierController";



const router = Router();
router.post('/', tenantMiddleware, createSupplierController)
router.get('/', tenantMiddleware, listSupplierController)
router.put('/', tenantMiddleware, updateSupplierController )
router.delete('/:id', tenantMiddleware, deleteSupplierController)
router.get('/:id', tenantMiddleware, getSupplierDetailsController)
export default router