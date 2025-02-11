import {loginController, registerAdminController} from "../controller/authController";
import {tenantMiddleware} from "../middlewares/tenantMiddleware";
import {Router} from "express";


const router = Router();

router.post('/login', loginController);
router.post('/', tenantMiddleware, registerAdminController);

export default router;