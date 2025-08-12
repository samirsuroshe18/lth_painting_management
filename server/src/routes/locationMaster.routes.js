import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewLocation, getLocations, updateLocation } from "../controllers/locationMaster.controller.js";

const router = Router();

router.route('/add-location').post(verifyJwt, checkAccess('locationMaster:edit'), addNewLocation);
router.route('/update-location/:id').put(verifyJwt, checkAccess('locationMaster:edit'), updateLocation);
router.route('/get-locations').get(verifyJwt, checkAccess('locationMaster:view'), getLocations)

export default router;