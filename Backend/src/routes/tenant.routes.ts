import { Router } from "express";
import { registerTenant, verifyAndPay } from "../controllers/tenant.controller";
import { cekStatusPembayaranTenant } from "../controllers/tenantStatus.controller";
const router = Router();

router.post("/register", registerTenant);
router.post("/verify", verifyAndPay);

router.get("/status-pembayaran/:orderId", cekStatusPembayaranTenant);

export default router;
