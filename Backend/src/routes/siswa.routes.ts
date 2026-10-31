import { Router } from "express";
import {
  createSiswa,
  getMySiswa,
  getSemuaSiswaAdmin,
  updateSiswaAdmin,
  bulkImportSiswa,
} from "../controllers/siswa.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { uploadSiswa } from "../middlewares/upload.middleware";
import { studentProfiles } from "../controllers/studentProfile.controller";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";

const router = Router();

router.use(authenticate);

router.get("/me", getMySiswa);
router.post("/", requireTenant, requireSubscription, authorizeRoles("super_admin", "admin_sekolah"), requireIzin("manajemen_pengguna.create"), studentProfiles);

// --- BARU ---
router.get(
  "/",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant, requireSubscription, requireIzin("manajemen_pengguna.view"), studentProfiles,
);
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin_sekolah"),
  requireTenant, requireSubscription, requireIzin("manajemen_pengguna.update"), studentProfiles,
);
// Endpoint upload excel, pakai multer .single("file")
router.get("/:id", requireTenant, requireSubscription, authorizeRoles("admin_sekolah"), requireIzin("manajemen_pengguna.view"), studentProfiles);
router.post(
  "/bulk-import",
  authorizeRoles("super_admin", "admin_sekolah"),
  uploadSiswa.single("file"),
  bulkImportSiswa,
);

export default router;
