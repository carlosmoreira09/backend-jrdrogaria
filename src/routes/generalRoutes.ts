import {Router} from "express";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {getTotalDataController} from "../controller/productController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router()

router.get('/', authMiddleware, tenantMiddleware, getTotalDataController)

export default router;