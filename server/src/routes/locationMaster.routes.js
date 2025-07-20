import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewLocation } from "../controllers/locationMaster.controller.js";

const router = Router();

// router.route('/create-user').post(verifyJwt, checkAccess('userMaster', 'dashboard'), createUser);
router.route('/add-location').post(addNewLocation);

export default router;