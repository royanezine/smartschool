import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createKelas,
  getKelas,
  getDetailKelas,
  updateKelas,
  deleteKelas,
} from "../controllers/kelas.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/", requireIzin("akademik.view"), getKelas);
router.get("/:id", requireIzin("akademik.view"), getDetailKelas);
router.post("/", requireIzin("akademik.create"), createKelas);
router.put("/:id", requireIzin("akademik.update"), updateKelas);
router.delete("/:id", requireIzin("akademik.delete"), deleteKelas);

export default router;
