import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import {
  generateRapot,
  listRapotKelas,
  isiCatatanRapot,
  publishRapot,
  listRapotSaya,
  detailRapotSaya,
  getDataRaportSiswa,
  getDashboardRapot,
} from "../controllers/raport.controller";

const router = Router();

router.use(authenticate, requireTenant, requireSubscription);

router.get("/dashboard", getDashboardRapot);

router.post("/kelas/:kelasId/generate", generateRapot);
router.get("/kelas/:kelasId", listRapotKelas);

router.put("/:rapotId/catatan", isiCatatanRapot);
router.put("/:rapotId/publish", publishRapot);

router.get("/siswa/saya", listRapotSaya);
router.get("/siswa/saya/:rapotId", detailRapotSaya);

router.get("/siswa/:siswaId/tahun-ajaran/:tahunAjaranId", getDataRaportSiswa);

export default router;