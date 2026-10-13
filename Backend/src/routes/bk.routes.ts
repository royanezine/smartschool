import { Router } from "express";
import {
  getSesiKonseling,
  getSesiKonselingById,
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
  getAsesmenMinatBakat,
  createAsesmenMinatBakat,
  updateAsesmenMinatBakat,
  deleteAsesmenMinatBakat,
} from "../controllers/bk.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, requireTenant);

// Konseling
router.get("/konseling", getSesiKonseling);
router.get("/konseling/:id", getSesiKonselingById);
router.post("/konseling", authorizeRoles("admin_sekolah", "guru"), createSesiKonseling);
router.put("/konseling/:id", authorizeRoles("admin_sekolah", "guru"), updateSesiKonseling);
router.delete("/konseling/:id", authorizeRoles("admin_sekolah", "guru"), deleteSesiKonseling);

// Kategori Pelanggaran
router.get("/kategori-pelanggaran", getKategoriPelanggaran);
router.post("/kategori-pelanggaran", authorizeRoles("admin_sekolah", "guru"), createKategoriPelanggaran);
router.put("/kategori-pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), updateKategoriPelanggaran);
router.delete("/kategori-pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), deleteKategoriPelanggaran);

// Pelanggaran Siswa
router.get("/pelanggaran", getPelanggaranSiswa);
router.post("/pelanggaran", authorizeRoles("admin_sekolah", "guru"), createPelanggaranSiswa);
router.put("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), updatePelanggaranSiswa);
router.delete("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), deletePelanggaranSiswa);

// Asesmen Minat Bakat
router.get("/asesmen-minat-bakat", getAsesmenMinatBakat);
router.post("/asesmen-minat-bakat", authorizeRoles("admin_sekolah", "guru"), createAsesmenMinatBakat);
router.put("/asesmen-minat-bakat/:id", authorizeRoles("admin_sekolah", "guru"), updateAsesmenMinatBakat);
router.delete("/asesmen-minat-bakat/:id", authorizeRoles("admin_sekolah", "guru"), deleteAsesmenMinatBakat);

export default router;