import { Router } from "express";
import {
  createShiftKerja,
  getShiftKerja,
  getShiftKerjaById,
  updateShiftKerja,
  deleteShiftKerja,
  assignUserShiftAndJabatan,
} from "../controllers/shiftKerja.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

// Akses terbatas: Admin Sekolah dan Superadmin
router.use(authorizeRoles("admin_sekolah", "super_admin"));

router.get("/", getShiftKerja);
router.post("/", createShiftKerja);
router.post("/assign-user", assignUserShiftAndJabatan);
router.get("/:id", getShiftKerjaById);
router.put("/:id", updateShiftKerja);
router.delete("/:id", deleteShiftKerja);

export default router;
