import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getKelasMapel,
  createKelasMapel,
  updateKelasMapel,
  deleteKelasMapel,
} from "../controllers/kelasMapel.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/", requireIzin("akademik.view"), getKelasMapel);
router.post("/", requireIzin("akademik.create"), createKelasMapel);
router.put("/:id", requireIzin("akademik.update"), updateKelasMapel);
router.delete("/:id", requireIzin("akademik.delete"), deleteKelasMapel);

export default router;