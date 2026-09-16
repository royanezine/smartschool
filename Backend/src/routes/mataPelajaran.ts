import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getMataPelajaran,
  createMataPelajaran,
  updateMataPelajaran,
  deleteMataPelajaran,
} from "../controllers/mataPelajaran.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/", requireIzin("akademik.view"), getMataPelajaran);
router.post("/", requireIzin("akademik.create"), createMataPelajaran);
router.put("/:id", requireIzin("akademik.update"), updateMataPelajaran);
router.delete("/:id", requireIzin("akademik.delete"), deleteMataPelajaran);

export default router;
