import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  requireTenant,
  requireSubscription,
} from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getShiftSiswa,
  updateShiftSiswa,
} from "../controllers/shiftSiswa.controller";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

router.get("/", requireIzin("akademik.view"), getShiftSiswa);
router.put(
  "/:kode",
  authorizeRoles("admin_sekolah", "super_admin"),
  requireIzin("akademik.update"),
  updateShiftSiswa,
);

export default router;