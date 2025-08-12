import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { addNewAsset, getAssets, getAssetsByLocation, getQrCodes, removeAsset, reviewAssetStatus, updateAsset, viewAsset, viewAssetPublic } from "../controllers/assetMaster.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/add-asset').post(verifyJwt, checkAccess('assetMaster:edit'), upload.single("file"), addNewAsset);
router.route('/view-asset/:id').get(verifyJwt, checkAccess('assetMaster'), viewAsset);
router.route('/view-asset/public/:assetId').get(viewAssetPublic);
router.route('/update-asset/:assetId').put(verifyJwt, checkAccess('assetMaster:edit'), upload.single("file"), updateAsset);
router.route('/review-asset-status/:assetId').put(verifyJwt, checkAccess('assetMaster:edit'), reviewAssetStatus);
router.route('/get-assets').get(verifyJwt, checkAccess('assetMaster:view'), getAssets)
router.route('/get-qr-codes').get(verifyJwt, checkAccess('generateQrCode'), getQrCodes)
router.route('/remove-asset/:id').delete(verifyJwt, checkAccess('assetMaster:edit'), removeAsset);
router.route('/get-assets-by-loc').post(verifyJwt, checkAccess('auditReport:view'), getAssetsByLocation);

export default router;