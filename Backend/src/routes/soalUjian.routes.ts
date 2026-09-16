import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createSoal,
  getSoalByUjian,
  getSoalById,
  updateSoal,
  deleteSoal,
} from "../controllers/soalUjian.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post("/", requireIzin("ujian.create"), createSoal);
router.get("/ujian/:ujianId", requireIzin("ujian.view"), getSoalByUjian);
router.get("/:id", requireIzin("ujian.view"), getSoalById);
router.put("/:id", requireIzin("ujian.update"), updateSoal);
router.delete("/:id", requireIzin("ujian.delete"), deleteSoal);

export default router;
