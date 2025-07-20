import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewState } from "../controllers/stateMaster.controller.js";

const router = Router();

// router.route('/create-user').post(verifyJwt, checkAccess('userMaster', 'dashboard'), createUser);
router.route('/add-state').post(addNewState);

export default router;