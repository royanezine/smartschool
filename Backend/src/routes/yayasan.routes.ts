import { Router } from "express";
import {
  getDashboardSummary,
  getDetailSekolahBinaan,
  listYayasan, manageYayasan, manageYayasanAdmins, manageYayasanSchools,
} from "../controllers/yayasan.controller";
import {
  buatSekolahCabang,
  listSekolahCabang,
} from "../controllers/yayasanSekolah.controller";
import {
  getPengaturanSekolahBinaan,
  listUsersLintasSekolah,
} from "../controllers/yayasanMonitoring.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  hanyaAdminYayasan,
  wajibLanggananYayasan,
} from "../middlewares/yayasan.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorizeRoles("super_admin"), listYayasan);
router.post("/", authorizeRoles("super_admin"), manageYayasan);

router.get("/summary", requireIzin("yayasan.view"), hanyaAdminYayasan, wajibLanggananYayasan, getDashboardSummary);

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

router.get("/sekolah/:id", requireIzin("yayasan.view"), hanyaAdminYayasan, wajibLanggananYayasan, getDetailSekolahBinaan);

router.get(
  "/monitoring/users",
  requireIzin("yayasan.view"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  listUsersLintasSekolah,
);

router.get(
  "/monitoring/sekolah/:id/pengaturan",
  requireIzin("yayasan.view"),
  hanyaAdminYayasan,
  wajibLanggananYayasan,
  getPengaturanSekolahBinaan,
);

// Specific legacy paths above must precede the UUID resource routes.
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
