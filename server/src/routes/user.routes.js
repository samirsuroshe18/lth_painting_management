import { Router } from "express";
import { changeCurrentPassword, forgotPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);

//Secure routes
router.route('/logout').get(verifyJwt, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/current-user').get(verifyJwt, getCurrentUser);
router.route('/change-password').post(verifyJwt, changeCurrentPassword);

export default router;