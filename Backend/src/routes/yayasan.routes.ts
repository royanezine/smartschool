import { Router } from "express";
import {
  getDashboardSummary,
  getDetailSekolahBinaan,
  manageYayasan,
  manageYayasanAdmins,
  manageYayasanSchools,
} from "../controllers/yayasan.controller";
import {
  buatSekolahCabang,
  listSekolahCabang,
} from "../controllers/yayasanSekolah.controller";
import {
  getPengaturanSekolahBinaan,
  listUsersLintasSekolah,
} from "../controllers/yayasanMonitoring.controller";
import {
  getDetailYayasanLangganan,
  listYayasanBerlangganan,
} from "../controllers/yayasanPlatform.controller";
import {
  getProfil,
  getProfilLengkap,
  updateProfil,
  updateProfilLengkap,
} from "../controllers/yayasanProfile.controller";
import {
  laporanAkademik,
  laporanInventaris,
  laporanSiswa,
  monitoringKehadiran,
  monitoringLms,
  monitoringNilai,
} from "../controllers/yayasanLaporan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  hanyaAdminYayasan,
  wajibLanggananYayasan,
} from "../middlewares/yayasan.middleware";

const router = Router();
const gerbang = [hanyaAdminYayasan, wajibLanggananYayasan];

router.use(authenticate);

router.get("/", authorizeRoles("super_admin"), listYayasanBerlangganan);
router.post("/", authorizeRoles("super_admin"), manageYayasan);

router.get("/summary", requireIzin("yayasan.view"), ...gerbang, getDashboardSummary);

router.post("/sekolah", requireIzin("yayasan.create"), ...gerbang, buatSekolahCabang);
router.get("/sekolah", requireIzin("yayasan.view"), ...gerbang, listSekolahCabang);
router.get("/sekolah/:id", requireIzin("yayasan.view"), ...gerbang, getDetailSekolahBinaan);

router.get("/profil", requireIzin("yayasan.view"), ...gerbang, getProfil);
router.put("/profil", requireIzin("yayasan.update"), ...gerbang, updateProfil);
router.get("/profil-lengkap", requireIzin("yayasan.view"), ...gerbang, getProfilLengkap);
router.put("/profil-lengkap", requireIzin("yayasan.update"), ...gerbang, updateProfilLengkap);

router.get("/laporan/siswa", requireIzin("yayasan.view"), ...gerbang, laporanSiswa);
router.get("/laporan/akademik", requireIzin("yayasan.view"), ...gerbang, laporanAkademik);
router.get("/laporan/inventaris", requireIzin("yayasan.view"), ...gerbang, laporanInventaris);

router.get("/monitoring/kehadiran", requireIzin("yayasan.view"), ...gerbang, monitoringKehadiran);
router.get("/monitoring/lms", requireIzin("yayasan.view"), ...gerbang, monitoringLms);
router.get("/monitoring/nilai", requireIzin("yayasan.view"), ...gerbang, monitoringNilai);
router.get("/monitoring/users", requireIzin("yayasan.view"), ...gerbang, listUsersLintasSekolah);
router.get(
  "/monitoring/sekolah/:id/pengaturan",
  requireIzin("yayasan.view"),
  ...gerbang,
  getPengaturanSekolahBinaan,
);

router.get("/:yayasanId/langganan", authorizeRoles("super_admin"), getDetailYayasanLangganan);

router.get("/:yayasanId", authorizeRoles("super_admin", "admin_yayasan"), requireIzin("yayasan.view"), manageYayasan);
router.put("/:yayasanId", authorizeRoles("super_admin", "admin_yayasan"), requireIzin("yayasan.update"), manageYayasan);
router.delete("/:yayasanId", authorizeRoles("super_admin"), manageYayasan);
router.get("/:yayasanId/sekolah", authorizeRoles("super_admin", "admin_yayasan"), requireIzin("yayasan.view"), manageYayasanSchools);
router.put("/:yayasanId/sekolah/:sekolahId", authorizeRoles("super_admin"), manageYayasanSchools);
router.delete("/:yayasanId/sekolah/:sekolahId", authorizeRoles("super_admin"), manageYayasanSchools);
router.get("/:yayasanId/admin", authorizeRoles("super_admin", "admin_yayasan"), requireIzin("yayasan.view"), manageYayasanAdmins);
router.post("/:yayasanId/admin", authorizeRoles("super_admin"), manageYayasanAdmins);
router.put("/:yayasanId/admin/:adminId", authorizeRoles("super_admin"), manageYayasanAdmins);
router.delete("/:yayasanId/admin/:adminId", authorizeRoles("super_admin"), manageYayasanAdmins);

export default router;