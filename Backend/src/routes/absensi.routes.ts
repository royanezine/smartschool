import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createAbsensi,
  getAbsensiSaya,
  getAbsensiKelas,
  exportRekapAbsensi,
} from "../controllers/absensi.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { uploadBiometrik } from "../middlewares/upload.middleware";
import { registerFaceIdByAdmin } from "../controllers/absensi.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "absensi");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `absen-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.use(authenticate, requireTenant);

router.post(
  "/",
  requireIzin("lms.create"),
  upload.single("snapshot"),
  createAbsensi,
);
router.get("/saya", requireIzin("lms.view"), getAbsensiSaya);
router.get("/kelas/:kelasId", requireIzin("lms.view"), getAbsensiKelas);
router.get("/export", requireIzin("laporan.view"), exportRekapAbsensi);
router.post(
  "/register-face",
  authenticate,
  uploadBiometrik.single("foto"),
  registerFaceIdByAdmin,
);

export default router;
