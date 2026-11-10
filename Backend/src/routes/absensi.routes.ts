import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { AppError } from "../utils/appError";
import {
  createAbsensi,
  getAbsensiSaya,
  getAbsensiKelas,
  getMonitoringGuru,
  exportRekapAbsensi,
  checkInShift,
  checkOutShift,
  getRiwayatShiftSaya,
  getMetodeAbsensiAktif,
  registerFaceIdByAdmin,
  getRiwayatAbsensiSiswa,
  getRekapAbsensiMapel,
} from "../controllers/absensi.controller";
import { registerFaceIdByParam } from "../controllers/faceId.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { requireAksesMenu } from "../middlewares/aksesMenu.middleware";
import { uploadBiometrik } from "../middlewares/upload.middleware";

import { authorizeRoles } from "../middlewares/role.middleware";
import { getAbsensiSekolah, updateAbsensiByAdmin } from "../controllers/adminAbsensi.controller";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads", "absensi");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/jpg"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `absen-${randomUUID()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (
      ALLOWED_IMAGE_MIME.includes(mime) &&
      [".jpg", ".jpeg", ".png"].includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Hanya file gambar (JPEG, PNG, JPG) yang diperbolehkan",
          400,
          "INVALID_FILE_TYPE",
        ),
      );
    }
  },
});

router.use(authenticate, requireTenant, requireLangganan());

router.get("/", authorizeRoles("admin_sekolah"), requireIzin("absensi.view", "lms.view"), getAbsensiSekolah);

router.post(
  "/",
  requireAksesMenu("absen saya", "create"),
  upload.single("snapshot"),
  createAbsensi,
);
router.get("/saya", requireAksesMenu("absen saya", "view"), getAbsensiSaya);
router.get("/rekap-mapel", requireIzin("lms.view", "laporan.view"), getRekapAbsensiMapel);
router.get("/monitoring-guru", getMonitoringGuru);
router.get("/kelas/:kelasId", requireIzin("lms.view"), getAbsensiKelas);
router.get("/export", requireIzin("laporan.view"), exportRekapAbsensi);
router.post(
  "/register-face",
  authorizeRoles("super_admin", "admin_sekolah"),
  uploadBiometrik.single("foto"),
  registerFaceIdByAdmin,
);
router.post(
  "/register-face/:id",
  authorizeRoles("super_admin", "admin_sekolah"),
  uploadBiometrik.single("foto"),
  registerFaceIdByParam,
);
router.get("/metode-aktif", getMetodeAbsensiAktif);

router.post("/check-in", upload.single("snapshot"), checkInShift);
router.post("/check-out", checkOutShift);
router.get("/shift-saya", getRiwayatShiftSaya);
router.get(
  "/siswa/:siswaId",
  requireIzin("absensi.view"),
  getRiwayatAbsensiSiswa,
);

router.patch("/:id", authorizeRoles("admin_sekolah"), requireIzin("absensi.update", "lms.update"), updateAbsensiByAdmin);

export default router;