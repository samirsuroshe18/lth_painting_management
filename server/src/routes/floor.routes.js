import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewFloor, deleteFloor, getAllFloor, updateFloor } from "../controllers/floorMaster.controller.js";

const router = Router();

router.route('/add-floor').post(verifyJwt, checkAccess('floorMaster:edit'), addNewFloor);
router.route('/get-all-floors').get(verifyJwt, checkAccess('floorMaster:view'), getAllFloor);
router.route('/update-floor/:id').put(verifyJwt, checkAccess('floorMaster:edit'), updateFloor);
router.route('/delete-floor/:id').delete(verifyJwt, checkAccess('floorMaster:edit'), deleteFloor);

export default router;