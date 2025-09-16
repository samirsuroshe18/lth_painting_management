import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewCity, deleteCity, getAllCities, updateCity } from "../controllers/cityMaster.controller.js";

const router = Router();

router.route('/add-city').post(verifyJwt, checkAccess('cityMaster:edit'), addNewCity);
router.route('/get-all-cities').get(verifyJwt, checkAccess('cityMaster:view'), getAllCities);
router.route('/update-city/:id').put(verifyJwt, checkAccess('cityMaster:edit'), updateCity);
router.route('/delete-city/:id').delete(verifyJwt, checkAccess('cityMaster:edit'), deleteCity);

export default router;