import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getSikapPerilaku,
  getSikapPerilakuById,
  createSikapPerilaku,
  updateSikapPerilaku,
  deleteSikapPerilaku,
} from "../controllers/sikapPerilaku.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.get("/", getSikapPerilaku);
router.get("/:id", getSikapPerilakuById);
router.post("/", authorizeRoles("super_admin", "admin_sekolah", "guru"), createSikapPerilaku);
router.put("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru"), updateSikapPerilaku);
router.delete("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru"), deleteSikapPerilaku);

export default router;

