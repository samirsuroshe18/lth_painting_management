import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewAsset, getAssets, getAssetsByLocation, removeAsset, reviewAssetStatus, updateAsset, viewAsset, viewAssetPublic } from "../controllers/assetMaster.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/add-asset').post(verifyJwt, checkAccess('assetMaster'), upload.single("file"), addNewAsset);
router.route('/view-asset/:id').get(verifyJwt, checkAccess('assetMaster'), viewAsset);
router.route('/view-asset/public/:assetId').get(viewAssetPublic);
router.route('/update-asset/:assetId').put(verifyJwt, checkAccess('assetMaster'), upload.single("file"), updateAsset);
router.route('/review-asset-status/:assetId').put(verifyJwt, checkAccess('assetMaster'), reviewAssetStatus);
router.route('/get-assets').get(verifyJwt, checkAccess('assetMaster'), getAssets)
router.route('/remove-asset/:id').delete(verifyJwt, checkAccess('assetMaster'), removeAsset);
router.route('/get-assets-by-loc').post(verifyJwt, checkAccess('assetMaster'), getAssetsByLocation);

export default router;