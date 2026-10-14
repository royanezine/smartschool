import { Router } from "express";
import {
  createKategoriJabatan,
  getKategoriJabatan,
  getKategoriJabatanById,
  updateKategoriJabatan,
  setTarifJabatan,
  deleteKategoriJabatan,
} from "../controllers/kategoriJabatan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant);

// Proteksi RBAC ketat: Hanya Admin Sekolah dan Superadmin
router.use(authorizeRoles("admin_sekolah", "super_admin"));

router.get("/", getKategoriJabatan);
router.post("/", createKategoriJabatan);
router.get("/:id", getKategoriJabatanById);
router.put("/:id", updateKategoriJabatan);
router.post("/:id/tarif", setTarifJabatan);
router.delete("/:id", deleteKategoriJabatan);

export default router;
