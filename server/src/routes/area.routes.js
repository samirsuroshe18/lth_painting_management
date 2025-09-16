import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewArea, deleteArea, getAllAreas, updateArea } from "../controllers/areaMaster.controller.js";

const router = Router();

router.route('/add-area').post(verifyJwt, checkAccess('areaMaster:edit'), addNewArea);
router.route('/get-all-areas').get(verifyJwt, checkAccess('areaMaster:view'), getAllAreas);
router.route('/update-area/:id').put(verifyJwt, checkAccess('areaMaster:edit'), updateArea);
router.route('/delete-area/:id').delete(verifyJwt, checkAccess('areaMaster:edit'), deleteArea);

export default router;