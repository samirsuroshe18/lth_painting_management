import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { checkAccess } from "../middlewares/checkAccess.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addNewAssetAudit, fetchAudits, getAssetAuditLogs, getAuditLogs, reviewAuditStatus, viewAuditLog } from "../controllers/assetAudit.controller.js";

const router = Router();

router.route('/add-asset-audit').post(verifyJwt, upload.fields([
  { name: 'assetImage', maxCount: 1 },
  { name: 'auditImage1', maxCount: 1 },
  { name: 'auditImage2', maxCount: 1 },
  { name: 'auditImage3', maxCount: 1 },
]), addNewAssetAudit);
router.route('/review-audit-status/:auditId').put(verifyJwt, checkAccess('dashboard:edit'), reviewAuditStatus);
router.route('/get-audit-logs').get(verifyJwt, checkAccess('dashboard:view'), getAuditLogs)
router.route('/get-asset-audit-logs/:assetId').get(verifyJwt, checkAccess('assetMaster:view'), getAssetAuditLogs)
router.route('/view-audit-log/:auditId').get(verifyJwt, checkAccess('assetMaster:view'), viewAuditLog);
router.route('/fetch-audits').post(verifyJwt, checkAccess('auditReport:view'), fetchAudits);

export default router;