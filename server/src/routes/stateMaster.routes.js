import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewState, deleteState, getAllStates, updateState } from "../controllers/stateMaster.controller.js";

const router = Router();

router.route('/add-state').post(verifyJwt, checkAccess('stateMaster:edit'), addNewState);
router.route('/get-all-states').get(verifyJwt, checkAccess('stateMaster:view'), getAllStates);
router.route('/update-state/:id').put(verifyJwt, checkAccess('stateMaster:edit'), updateState);
router.route('/delete-state/:id').delete(verifyJwt, checkAccess('stateMaster:edit'), deleteState);

export default router;