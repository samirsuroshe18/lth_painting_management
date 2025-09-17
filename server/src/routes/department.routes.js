import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addDepartmentsFromExcel, addNewDepartment, deleteDepartment, getAllDepartment, updateDepartment } from "../controllers/departmentMaster.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/add-excel-department').post(verifyJwt, checkAccess('departmentMaster:edit'), upload.single("file"), addDepartmentsFromExcel);
router.route('/add-department').post(verifyJwt, checkAccess('departmentMaster:edit'), addNewDepartment);
router.route('/get-all-departments').get(verifyJwt, checkAccess('departmentMaster:view'), getAllDepartment);
router.route('/update-department/:id').put(verifyJwt, checkAccess('departmentMaster:edit'), updateDepartment);
router.route('/delete-department/:id').delete(verifyJwt, checkAccess('departmentMaster:edit'), deleteDepartment);

export default router;