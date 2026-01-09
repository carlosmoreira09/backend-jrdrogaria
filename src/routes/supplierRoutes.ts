import { Router } from 'express';
import {
    createSupplierController,
    deleteSupplierController,
    getSupplierDetailsController,
    listSupplierController,
    updateSupplierController
} from "../controller/supplierController";
import {authMiddleware} from "../middlewares/authMiddleware";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";



const router = Router();
router.post('/',authMiddleware,tenantMiddleware, createSupplierController)
router.get('/',authMiddleware,tenantMiddleware,  listSupplierController)
router.put('/', authMiddleware,tenantMiddleware, updateSupplierController )
router.delete('/:id', authMiddleware,tenantMiddleware, deleteSupplierController)
router.get('/:id', authMiddleware,tenantMiddleware,  getSupplierDetailsController)
export default router