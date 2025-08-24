import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addLocationToSuperAdmin, addNewLocation, deleteLocation, getLocations, updateLocation } from "../controllers/locationMaster.controller.js";

const router = Router();

router.route('/add-location').post(verifyJwt, checkAccess('locationMaster:edit'), addNewLocation);
router.route('/update-location/:id').put(verifyJwt, checkAccess('locationMaster:edit'), updateLocation);
router.route('/get-locations').get(verifyJwt, checkAccess('locationMaster:view'), getLocations)
router.route('/delete-location/:id').delete(verifyJwt, checkAccess('locationMaster:edit'), deleteLocation);
router.route('/add-location-to-superadmin/:id').put(verifyJwt, checkAccess('locationMaster:edit'), addLocationToSuperAdmin);

export default router;