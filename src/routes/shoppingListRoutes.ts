import { Router } from 'express';
import {
    createShoppingListController,
    deleteShoppingListController, getShoppingListDetailController,
    listShoppingListController
} from "../controller/shoppingListController";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {authMiddleware} from "../middlewares/authMiddleware";



const router = Router();
router.post('/', authMiddleware,tenantMiddleware, createShoppingListController)
router.get('/',authMiddleware,tenantMiddleware, listShoppingListController)
router.delete('/:id',authMiddleware,tenantMiddleware, deleteShoppingListController)
router.get('/:id',authMiddleware,tenantMiddleware, getShoppingListDetailController)
export default router