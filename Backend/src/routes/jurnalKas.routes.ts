import { Router } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";
import { KEUANGAN_READ, KEUANGAN_WRITE } from "../utils/keuangan.roles";
import {
  listAkun,
  createAkun,
  updateAkun,
  deleteAkun,
  listJurnal,
  createJurnal,
  batalkanJurnal,
  laporanKas,
  bukuKas,
} from "../controllers/jurnalKas.controller";

const router = Router();

router.get("/akun-kas", authorizeRoles(...KEUANGAN_READ), listAkun);
router.post("/akun-kas", authorizeRoles(...KEUANGAN_WRITE), createAkun);
router.put("/akun-kas/:id", authorizeRoles(...KEUANGAN_WRITE), updateAkun);
router.delete("/akun-kas/:id", authorizeRoles(...KEUANGAN_WRITE), deleteAkun);

router.get("/jurnal-kas", authorizeRoles(...KEUANGAN_READ), listJurnal);
router.post("/jurnal-kas", authorizeRoles(...KEUANGAN_WRITE), createJurnal);
router.post("/jurnal-kas/:id/batal", authorizeRoles(...KEUANGAN_WRITE), batalkanJurnal);

router.get("/laporan-kas", authorizeRoles(...KEUANGAN_READ), laporanKas);
router.get("/buku-kas", authorizeRoles(...KEUANGAN_READ), bukuKas);

export default router;