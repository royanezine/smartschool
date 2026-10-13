import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { uploadBuktiIzin } from "../middlewares/upload.middleware";
import {
  ajukanIzin,
  getDaftarIzin,
  verifikasiIzin,
} from "../controllers/permohonanIzin.controller";

const router = Router();

// Endpoint POST menggunakan multer '.single("bukti")' untuk menangkap file dari field form 'bukti'
router.post("/", authenticate, uploadBuktiIzin.single("bukti"), ajukanIzin);

// Endpoint GET & PATCH
router.get("/", authenticate, getDaftarIzin);
router.patch(
  "/:id/verifikasi",
  authenticate,
  authorizeRoles("super_admin", "admin_sekolah", "guru"),
  verifikasiIzin,
);

export default router;
