import { Router } from "express";
import {
  getPengaturanPresensi,
  updatePengaturanPresensi,
} from "../controllers/sekolahPengaturan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);
router.get("/pengaturan-presensi", getPengaturanPresensi);
router.put(
  "/pengaturan-presensi",
  authorizeRoles("admin_sekolah", "super_admin"),
  updatePengaturanPresensi,
);

export default router;