import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
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
router.patch("/:id/verifikasi", authenticate, verifikasiIzin);

export default router;
