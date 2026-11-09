import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { getKkm, setKkm } from "../controllers/kkm.controller";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

router.get("/", authorizeRoles("admin_sekolah"), getKkm);
router.post("/", authorizeRoles("admin_sekolah"), setKkm);

export default router;