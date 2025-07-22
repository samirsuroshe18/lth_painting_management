import { Router } from "express";
import { changeCurrentPassword, forgotPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/refresh-token').get(refreshAccessToken);
router.route('/logout').get(logoutUser);

//Secure routes
router.route('/current-user').get(verifyJwt, getCurrentUser);
router.route('/change-password').post(verifyJwt, changeCurrentPassword);

export default router;