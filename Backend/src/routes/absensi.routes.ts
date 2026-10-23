import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
} from "../controllers/absensi.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { uploadBiometrik } from "../middlewares/upload.middleware";

import { authorizeRoles } from "../middlewares/role.middleware";

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

router.use(authenticate, requireTenant, requireSubscription);

router.post(
  "/",
  requireIzin("lms.create"),
  upload.single("snapshot"),
  createAbsensi,
);
router.get("/saya", requireIzin("lms.view"), getAbsensiSaya);
router.get("/monitoring-guru", getMonitoringGuru);
router.get("/kelas/:kelasId", requireIzin("lms.view"), getAbsensiKelas);
router.get("/export", requireIzin("laporan.view"), exportRekapAbsensi);
router.post(
  "/register-face",
  authorizeRoles("super_admin", "admin_sekolah"),
  uploadBiometrik.single("foto"),
  registerFaceIdByAdmin,
);
router.get("/metode-aktif", getMetodeAbsensiAktif);

router.post("/check-in", checkInShift);
router.post("/check-out", checkOutShift);
router.get("/shift-saya", getRiwayatShiftSaya);
router.get(
  "/siswa/:siswaId",
  requireIzin("absensi.view"),
  getRiwayatAbsensiSiswa,
);

export default router;
