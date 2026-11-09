import { Router } from "express";
import {
  createSiswa,
  getMySiswa,
  getSemuaSiswaAdmin,
  updateSiswaAdmin,
  bulkImportSiswa,
  deleteSiswa,
} from "../controllers/siswa.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { uploadSiswa, verifyMagicByteSiswa } from "../middlewares/upload.middleware";
import { studentProfiles } from "../controllers/studentProfile.controller";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { requireIzin } from "../middlewares/izin.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", getMySiswa);

router.post(
  "/",
  requireTenant,
  requireLangganan(),
  authorizeRoles("super_admin", "admin_sekolah"),
  requireIzin("manajemen_pengguna.create"),
  createSiswa,
);

router.get(
  "/",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant,
  requireLangganan(),
  requireIzin("manajemen_pengguna.view"),
  getSemuaSiswaAdmin,
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant,
  requireLangganan(),
  requireIzin("manajemen_pengguna.update"),
  updateSiswaAdmin,
);

router.get(
  "/:id",
  requireTenant,
  requireLangganan(),
  authorizeRoles("admin_sekolah"),
  requireIzin("manajemen_pengguna.view"),
  studentProfiles,
);

router.post(
  "/bulk-import",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant,
  requireLangganan(),
  uploadSiswa.single("file"),
  verifyMagicByteSiswa,
  bulkImportSiswa,
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant,
  requireLangganan(),
  requireIzin("manajemen_pengguna.delete"),
  deleteSiswa,
);

export default router;