import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewLocation, getLocations, updateLocation } from "../controllers/locationMaster.controller.js";

const router = Router();

router.route('/add-location').post(verifyJwt, checkAccess('userMaster', 'dashboard'), addNewLocation);
router.route('/update-location/:id').put(verifyJwt, checkAccess('userMaster', 'dashboard'), updateLocation);
router.route('/get-locations').get(verifyJwt, checkAccess('userMaster', 'dashboard'), getLocations)

export default router;