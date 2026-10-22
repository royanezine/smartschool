import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  createKelas,
  getKelas,
  getDetailKelas,
  updateKelas,
  deleteKelas,
  getShiftKelas,
  updateShiftKelas,
  updateShiftKelasMassal,
} from "../controllers/kelas.controller";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

router.get("/", requireIzin("akademik.view"), getKelas);
router.get("/:id/shift", requireIzin("akademik.view"), getShiftKelas);
router.get("/:id", requireIzin("akademik.view"), getDetailKelas);
router.post("/", requireIzin("akademik.create"), createKelas);
router.patch(
  "/shift-massal",
  authorizeRoles("admin_sekolah", "super_admin"),
  requireIzin("akademik.update"),
  updateShiftKelasMassal,
);
router.patch(
  "/:id/shift",
  authorizeRoles("admin_sekolah", "super_admin"),
  requireIzin("akademik.update"),
  updateShiftKelas,
);
router.put("/:id", requireIzin("akademik.update"), updateKelas);
router.delete("/:id", requireIzin("akademik.delete"), deleteKelas);

export default router;