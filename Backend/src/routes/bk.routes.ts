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
  exportPelanggaranExcel,
  exportPelanggaranPdf,
  createPelanggaranSiswa,
  updatePelanggaranSiswa,
  deletePelanggaranSiswa,
} from "../controllers/bk.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { requireAksesMenu } from "../middlewares/aksesMenu.middleware";
import { requestLimit } from "../middlewares/requestLimit.middleware";

const router = Router();

// Proteksi Autentikasi, Tenant, Langganan, Rate Limit & RBAC Menu Bimbingan Konseling
router.use(authenticate, requireTenant, requireSubscription);
router.use(requestLimit(60, 60 * 1000));
router.use(requireAksesMenu("bimbingan konseling"));

router.get("/konseling", getSesiKonseling);
router.post("/konseling/ajukan", authorizeRoles("siswa"), requestLimit(10), ajukanSesiKonseling);
router.get("/konseling/:id", getSesiKonselingById);
router.put(
  "/konseling/:id/keputusan",
  authorizeRoles("admin_sekolah", "guru"),
  requireAksesMenu("bimbingan konseling", "update"),
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
router.get("/pelanggaran/export/excel", exportPelanggaranExcel);
router.get("/pelanggaran/export/pdf", exportPelanggaranPdf);
router.post("/pelanggaran", authorizeRoles("admin_sekolah", "guru"), createPelanggaranSiswa);
router.put("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), updatePelanggaranSiswa);
router.delete("/pelanggaran/:id", authorizeRoles("admin_sekolah", "guru"), deletePelanggaranSiswa);

export default router;