import { Router } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";
import { KEUANGAN_READ, KEUANGAN_WRITE } from "../utils/keuangan.roles";
import {
  generateTagihan,
  ringkasanTagihan,
  listTagihan,
  detailTagihan,
  batalkanTagihan,
  rekapTunggakanSiswa,
  listTunggakan,
} from "../controllers/tagihan.controller";

const router = Router();

router.post("/tagihan/generate", authorizeRoles(...KEUANGAN_WRITE), generateTagihan);
router.get("/tagihan/ringkasan", authorizeRoles(...KEUANGAN_READ), ringkasanTagihan);
router.get("/tagihan", authorizeRoles(...KEUANGAN_READ), listTagihan);
router.get("/tagihan/:id", authorizeRoles(...KEUANGAN_READ), detailTagihan);
router.post("/tagihan/:id/batal", authorizeRoles(...KEUANGAN_WRITE), batalkanTagihan);

router.get("/tunggakan/rekap-siswa", authorizeRoles(...KEUANGAN_READ), rekapTunggakanSiswa);
router.get("/tunggakan", authorizeRoles(...KEUANGAN_READ), listTunggakan);

export default router;