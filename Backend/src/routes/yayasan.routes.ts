import { Router } from "express";
import {
  getDashboardSummary,
  getDetailSekolahBinaan,
} from "../controllers/yayasan.controller";
import {
  buatSekolahCabang,
  listSekolahCabang,
} from "../controllers/yayasanSekolah.controller";
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

export default router;