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
router.post('/', createSupplierController)
router.get('/', listSupplierController)
router.put('/', updateSupplierController )
router.delete('/:id', deleteSupplierController)
router.get('/:id', getSupplierDetailsController)
export default router