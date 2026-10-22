import { Router } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";
import { KEUANGAN_READ, KEUANGAN_WRITE } from "../utils/keuangan.roles";
import {
  laporanTabungan,
  setorTabungan,
  tarikTabungan,
  mutasiTabungan,
  detailTabunganSiswa,
  listTabungan,
  cariSiswaTabungan,
} from "../controllers/tabungan.controller";

const router = Router();

router.get("/tabungan/cari-siswa", authorizeRoles(...KEUANGAN_WRITE), cariSiswaTabungan);
router.get("/tabungan/laporan", authorizeRoles(...KEUANGAN_READ), laporanTabungan);
router.post("/tabungan/setor", authorizeRoles(...KEUANGAN_WRITE), setorTabungan);
router.post("/tabungan/tarik", authorizeRoles(...KEUANGAN_WRITE), tarikTabungan);
router.get("/tabungan/siswa/:siswaId/mutasi", authorizeRoles(...KEUANGAN_READ), mutasiTabungan);
router.get("/tabungan/siswa/:siswaId", authorizeRoles(...KEUANGAN_READ), detailTabunganSiswa);
router.get("/tabungan", authorizeRoles(...KEUANGAN_READ), listTabungan);

export default router;