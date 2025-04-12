import {loginController, registerAdminController} from "../controller/authController";
import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";


const router = Router();

router.post('/login', loginController);
router.post('/',authMiddleware, tenantMiddleware, registerAdminController);

export default router;