import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getKelasMapel,
  getMapelDiampu,
  getMapelSiswa,
  getDetailKelasMapel,
  createKelasMapel,
  updateKelasMapel,
  deleteKelasMapel,
} from "../controllers/kelasMapel.controller";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

router.get("/diampu", authorizeRoles("admin_sekolah", "guru"), getMapelDiampu);
router.get("/siswa", authorizeRoles("admin_sekolah", "siswa"), getMapelSiswa);
router.get(
  "/detail/:id",
  authorizeRoles("admin_sekolah", "guru"),
  getDetailKelasMapel,
);

router.get("/", requireIzin("akademik.view"), getKelasMapel);
router.post("/", requireIzin("akademik.create"), createKelasMapel);
router.put("/:id", requireIzin("akademik.update"), updateKelasMapel);
router.delete("/:id", requireIzin("akademik.delete"), deleteKelasMapel);

export default router;