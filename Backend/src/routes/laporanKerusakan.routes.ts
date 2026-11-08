import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getLaporanKerusakan,
  getLaporanKerusakanById,
  createLaporanKerusakan,
  updateLaporanKerusakan,
  deleteLaporanKerusakan,
} from "../controllers/laporanKerusakan.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.get("/", getLaporanKerusakan);
router.get("/:id", getLaporanKerusakanById);
router.post("/", authorizeRoles("super_admin", "admin_sekolah", "guru", "staff"), createLaporanKerusakan);
router.put("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru", "staff"), updateLaporanKerusakan);
router.delete("/:id", authorizeRoles("super_admin", "admin_sekolah"), deleteLaporanKerusakan);

export default router;

