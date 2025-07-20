import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { createUser } from "../controllers/userMaster.controller.js";

const router = Router();

// router.route('/create-user').post(verifyJwt, checkAccess('userMaster', 'dashboard'), createUser);
router.route('/create-user').post(createUser);

export default router;