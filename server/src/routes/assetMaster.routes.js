import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewAsset } from "../controllers/assetMaster.controller.js";

const router = Router();

router.route('/add-asset').post(verifyJwt, checkAccess('assetMaster'), addNewAsset);

export default router;