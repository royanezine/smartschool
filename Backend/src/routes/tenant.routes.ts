import { Router } from "express";
import { registerTenant, verifyAndPay } from "../controllers/tenant.controller";
import { cekStatusPembayaranTenant } from "../controllers/tenantStatus.controller";
import { requestLimit } from "../middlewares/requestLimit.middleware";
const router = Router();

router.post("/register", requestLimit(10), registerTenant);
router.post("/verify", requestLimit(15), verifyAndPay);

router.get("/status-pembayaran/:orderId", cekStatusPembayaranTenant);

export default router;
