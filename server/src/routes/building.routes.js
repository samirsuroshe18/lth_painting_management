import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewBuilding, deleteBuilding, getAllBuilding, updateBuilding } from "../controllers/buildingMaster.controller.js";

const router = Router();

router.route('/add-building').post(verifyJwt, checkAccess('buildingMaster:edit'), addNewBuilding);
router.route('/get-all-buildings').get(verifyJwt, checkAccess('buildingMaster:view'), getAllBuilding);
router.route('/update-building/:id').put(verifyJwt, checkAccess('buildingMaster:edit'), updateBuilding);
router.route('/delete-building/:id').delete(verifyJwt, checkAccess('buildingMaster:edit'), deleteBuilding);

export default router;