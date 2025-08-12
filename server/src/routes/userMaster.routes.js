import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { createUser, getAllUsers, updateUser, fetchUser,updatePermissions, removeUser } from "../controllers/userMaster.controller.js";

const router = Router();

router.route('/create-user').post(verifyJwt, checkAccess('userMaster:edit'), createUser);
router.route('/get-all-users').get(verifyJwt, checkAccess('userMaster:view'), getAllUsers);
router.route('/update-user/:userId').put(verifyJwt, checkAccess('userMaster:edit'), updateUser);
router.route('/fetch-user/:userId').get(verifyJwt, checkAccess('roleMaster:view'), fetchUser);
router.route('/update-user-permissions/:userId').put(verifyJwt, checkAccess('roleMaster:view'), updatePermissions);
router.route('/remove-user/:id').delete(verifyJwt, checkAccess('userMaster:edit'), removeUser);

export default router;