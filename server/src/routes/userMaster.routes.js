import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { createUser, getAllUsers, updateUser } from "../controllers/userMaster.controller.js";

const router = Router();

router.route('/create-user').post(verifyJwt, checkAccess('userMaster', 'masters'), createUser);
router.route('/get-all-users').get(verifyJwt, checkAccess('userMaster', 'masters'), getAllUsers);
router.route('/update-user/:userId').put(verifyJwt, checkAccess('userMaster', 'masters'), updateUser);

export default router;