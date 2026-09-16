import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createUjian,
  getUjianByKelasMapel,
  getDetailUjian,
  updateUjian,
  deleteUjian,
  mulaiPercobaanUjian,
  submitJawabanDanSelesai,
} from "../controllers/ujian.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post("/", requireIzin("ujian.create"), createUjian);
router.put("/:id", requireIzin("ujian.update"), updateUjian);
router.delete("/:id", requireIzin("ujian.delete"), deleteUjian);

router.get(
  "/kelas-mapel/:kelasMapelId",
  requireIzin("ujian.view"),
  getUjianByKelasMapel,
);
router.get("/:id", requireIzin("ujian.view"), getDetailUjian);
router.post("/:id/mulai", requireIzin("ujian.view"), mulaiPercobaanUjian);
router.post(
  "/sesi/:sesiId/submit",
  requireIzin("ujian.view"),
  submitJawabanDanSelesai,
);

export default router;
