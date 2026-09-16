import { Router } from "express";
import {
  getSekolahBinaan,
  getDashboardSummary,
  getDetailSekolahBinaan,
} from "../controllers/yayasan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware"; // <-- Gunakan izin granular

const router = Router();

router.use(authenticate);

router.get("/summary", requireIzin("yayasan.view"), getDashboardSummary);
router.get("/sekolah", requireIzin("yayasan.view"), getSekolahBinaan);
router.get("/sekolah/:id", requireIzin("yayasan.view"), getDetailSekolahBinaan);

export default router;
