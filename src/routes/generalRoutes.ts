import {Router} from "express";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {getTotalDataController} from "../controller/productController";

const router = Router()

router.get('/', tenantMiddleware, getTotalDataController)

export default router;