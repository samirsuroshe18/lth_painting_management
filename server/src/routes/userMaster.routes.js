import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { createUser, getAllUsers } from "../controllers/userMaster.controller.js";

const router = Router();

// router.route('/create-user').post(verifyJwt, checkAccess('userMaster', 'dashboard'), createUser);
router.post("/create-user", createUser);
router.get("/all-users", getAllUsers);

export default router;
