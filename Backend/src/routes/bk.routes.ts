import { Router } from "express";
import {
  getSesiKonseling,
  getSesiKonselingById,
  ajukanSesiKonseling,
  putuskanPengajuanKonseling,
  batalkanPengajuanKonseling,
  createSesiKonseling,
  updateSesiKonseling,
  deleteSesiKonseling,
  getKategoriPelanggaran,
  createKategoriPelanggaran,
  updateKategoriPelanggaran,
  deleteKategoriPelanggaran,
  getPelanggaranSiswa,
  createPelanggaranSiswa,
  updatePelanggaranSiswa,
  deletePelanggaranSiswa,
} from "../controllers/bk.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/konseling", getSesiKonseling);
router.post("/konseling/ajukan", authorizeRoles("siswa"), ajukanSesiKonseling);
router.get("/konseling/:id", getSesiKonselingById);
router.put(
  "/konseling/:id/keputusan",
  authorizeRoles("admin_sekolah", "guru"),
  putuskanPengajuanKonseling,
);
router.put(
  "/konseling/:id/batal",
  authorizeRoles("siswa"),
  batalkanPengajuanKonseling,
);
router.post("/konseling", authorizeRoles("admin_sekolah", "guru"), createSesiKonseling);
router.put("/konseling/:id", authorizeRoles("admin_sekolah", "guru"), updateSesiKonseling);
router.delete("/konseling/:id", authorizeRoles("admin_sekolah", "guru"), deleteSesiKonseling);

router.get("/kategori-pelanggaran", getKategoriPelanggaran);
router.post("/kategori-pelanggaran", authorizeRoles("admin_sekolah", "guru"), createKategoriPelanggaran);
router.put("/kategori-pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), updateKategoriPelanggaran);
router.delete("/kategori-pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), deleteKategoriPelanggaran);

router.get("/pelanggaran", getPelanggaranSiswa);
router.post("/pelanggaran", authorizeRoles("admin_sekolah", "guru"), createPelanggaranSiswa);
router.put("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), updatePelanggaranSiswa);
router.delete("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), deletePelanggaranSiswa);

export default router;