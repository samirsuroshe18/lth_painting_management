import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addFloorsFromExcel, addNewFloor, deleteFloor, getAllFloor, updateFloor } from "../controllers/floorMaster.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/add-excel-floors').post(verifyJwt, checkAccess('floorMaster:edit'), upload.single("file"), addFloorsFromExcel);
router.route('/add-floor').post(verifyJwt, checkAccess('floorMaster:edit'), addNewFloor);
router.route('/get-all-floors').get(verifyJwt, checkAccess('floorMaster:view'), getAllFloor);
router.route('/update-floor/:id').put(verifyJwt, checkAccess('floorMaster:edit'), updateFloor);
router.route('/delete-floor/:id').delete(verifyJwt, checkAccess('floorMaster:edit'), deleteFloor);

export default router;