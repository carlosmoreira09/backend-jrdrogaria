import { Router } from 'express';
import {
    createSupplierController,
    deleteSupplierController,
    getSupplierDetailsController,
    listSupplierController,
    updateSupplierController
} from "../controller/supplierController";
import {authMiddleware} from "../middlewares/authMiddleware";



const router = Router();
router.post('/',authMiddleware, createSupplierController)
router.get('/',authMiddleware, listSupplierController)
router.put('/', authMiddleware,updateSupplierController )
router.delete('/:id', authMiddleware,deleteSupplierController)
router.get('/:id', authMiddleware, getSupplierDetailsController)
export default router