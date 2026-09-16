import { Router } from "express";
import { registerTenant, verifyAndPay } from "../controllers/tenant.controller";

const router = Router();

router.post("/register", registerTenant);
router.post("/verify", verifyAndPay);

export default router;
