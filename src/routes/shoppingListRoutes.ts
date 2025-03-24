import { Router } from 'express';
import {
    createShoppingListController,
    deleteShoppingListController, getShoppingListDetailController,
    listShoppingListController
} from "../controller/shoppingListController";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";



const router = Router();
router.post('/', tenantMiddleware, createShoppingListController)
router.get('/',tenantMiddleware, listShoppingListController)
router.delete('/:id',tenantMiddleware, deleteShoppingListController)
router.get('/:id',tenantMiddleware, getShoppingListDetailController)
export default router