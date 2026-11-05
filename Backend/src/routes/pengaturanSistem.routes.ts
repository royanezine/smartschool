import { Router } from "express";
import {
  getPengaturanSekolah,
  upsertPengaturanSekolah,
} from "../controllers/pengaturanSistem.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { getKkm, setKkm } from "../controllers/kkm.controller";
import {
  attendanceSettings,
  aggregateSettings,
} from "../controllers/settingsConfiguration.controller";
import {
  ambilSemuaPengaturanGlobal,
  ambilPengaturanGlobal,
  simpanPengaturanGlobal,
  ambilPengaturanGlobalPublik,
} from "../controllers/pengaturanGlobal.controller";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";

const router = Router();

router.use(authenticate);

router.get("/global/publik", ambilPengaturanGlobalPublik);

router.use(authorizeRoles("super_admin", "admin_sekolah", "admin_yayasan"));

router.get("/global/semua", authorizeRoles("super_admin"), ambilSemuaPengaturanGlobal);
router.get("/global", authorizeRoles("super_admin"), ambilPengaturanGlobal);
router.put("/global", authorizeRoles("super_admin"), simpanPengaturanGlobal);
router.get("/global/:kelompok", authorizeRoles("super_admin"), ambilPengaturanGlobal);
router.put("/global/:kelompok", authorizeRoles("super_admin"), simpanPengaturanGlobal);

router.get("/hari-aktif", requireTenant, requireSubscription, requireIzin("lms.view"), attendanceSettings);
router.put("/hari-aktif", requireTenant, requireSubscription, requireIzin("lms.update"), attendanceSettings);
router.get("/agregat-rapor", requireTenant, requireSubscription, requireIzin("akademik.view"), aggregateSettings);
router.put("/agregat-rapor", requireTenant, requireSubscription, requireIzin("akademik.update"), aggregateSettings);

router.get("/", getPengaturanSekolah);
router.post("/", upsertPengaturanSekolah);

router.get("/kkm", authenticate, authorizeRoles("admin_sekolah"), getKkm);
router.post("/kkm", authenticate, authorizeRoles("admin_sekolah"), setKkm);

export default router;