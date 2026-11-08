import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getPrestasi,
  getPrestasiById,
  createPrestasi,
  updatePrestasi,
  deletePrestasi,
} from "../controllers/prestasi.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.get("/", getPrestasi);
router.get("/:id", getPrestasiById);
router.post("/", authorizeRoles("super_admin", "admin_sekolah", "guru"), createPrestasi);
router.put("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru"), updatePrestasi);
router.delete("/:id", authorizeRoles("super_admin", "admin_sekolah", "guru"), deletePrestasi);

export default router;

