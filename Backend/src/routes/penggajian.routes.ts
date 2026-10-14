import { Router } from "express";
import {
  kalkulasiPenggajian,
  getPenggajian,
  getPenggajianById,
  freezePenggajian,
  freezePeriodePenggajian,
  updateStatusPenggajian,
  getSlipGajiSaya,
} from "../controllers/penggajian.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant);

// Rute untuk pegawai/guru melihat slip gajinya sendiri yang sudah disetujui/dibekukan
router.get("/slip/saya", getSlipGajiSaya);

// Rute Pengelolaan & Kalkulasi Gaji: Khusus Admin Sekolah & Superadmin
router.post(
  "/kalkulasi",
  authorizeRoles("admin_sekolah", "super_admin"),
  kalkulasiPenggajian,
);

router.get(
  "/",
  authorizeRoles("admin_sekolah", "super_admin"),
  getPenggajian,
);

router.get(
  "/:id",
  authorizeRoles("admin_sekolah", "super_admin"),
  getPenggajianById,
);

router.patch(
  "/:id/freeze",
  authorizeRoles("admin_sekolah", "super_admin"),
  freezePenggajian,
);

router.patch(
  "/:id/status",
  authorizeRoles("admin_sekolah", "super_admin"),
  updateStatusPenggajian,
);

router.post(
  "/freeze-periode",
  authorizeRoles("admin_sekolah", "super_admin"),
  freezePeriodePenggajian,
);

export default router;
