import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getFasilitas,
  getFasilitasById,
  createFasilitas,
  updateFasilitas,
  deleteFasilitas,
} from "../controllers/fasilitas.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.get("/", getFasilitas);
router.get("/:id", getFasilitasById);
router.post("/", authorizeRoles("super_admin", "admin_sekolah", "guru", "staff"), createFasilitas);
router.put("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru", "staff"), updateFasilitas);
router.delete("/:id", authorizeRoles("super_admin", "admin_sekolah"), deleteFasilitas);

export default router;

