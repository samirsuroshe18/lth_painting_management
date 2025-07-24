import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewState, getAllStates, updateState } from "../controllers/stateMaster.controller.js";

const router = Router();

router.route('/add-state').post(verifyJwt, checkAccess('userMaster', 'dashboard'), addNewState);
router.route('/get-all-states').get(verifyJwt, checkAccess('userMaster', 'dashboard'), getAllStates);
router.route('/update-state/:id').put(verifyJwt, checkAccess('userMaster', 'dashboard'), updateState);



export default router;