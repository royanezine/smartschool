import { Router } from "express";
import {
  getDashboardSummary,
  getDetailSekolahBinaan,
} from "../controllers/yayasan.controller";
import {
  buatSekolahCabang,
  listSekolahCabang,
} from "../controllers/yayasanSekolah.controller";
import {
  getPengaturanSekolahBinaan,
  listUsersLintasSekolah,
} from "../controllers/yayasanMonitoring.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  hanyaAdminYayasan,
  wajibLanggananYayasan,
} from "../middlewares/yayasan.middleware";

const router = Router();

router.use(authenticate);

router.get("/summary", requireIzin("yayasan.view"), getDashboardSummary);

router.post(
  "/sekolah",
  requireIzin("yayasan.create"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  buatSekolahCabang,
);

router.get(
  "/sekolah",
  requireIzin("yayasan.view"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  listSekolahCabang,
);

router.get("/sekolah/:id", requireIzin("yayasan.view"), getDetailSekolahBinaan);

router.get(
  "/monitoring/users",
  requireIzin("yayasan.view"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  listUsersLintasSekolah,
);

router.get(
  "/monitoring/sekolah/:id/pengaturan",
  requireIzin("yayasan.view"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  getPengaturanSekolahBinaan,
);

export default router;