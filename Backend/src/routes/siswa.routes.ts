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

const router = Router();

router.use(authenticate);

router.get("/me", getMySiswa);
router.post("/", authorizeRoles("super_admin", "admin_sekolah"), createSiswa);

// --- BARU ---
router.get(
  "/",
  authorizeRoles("super_admin", "admin_sekolah"),
  getSemuaSiswaAdmin,
);
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin_sekolah"),
  updateSiswaAdmin,
);
// Endpoint upload excel, pakai multer .single("file")
router.post(
  "/bulk-import",
  authorizeRoles("super_admin", "admin_sekolah"),
  uploadSiswa.single("file"),
  bulkImportSiswa,
);

export default router;
