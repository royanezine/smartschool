import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getTahunAjaran,
  createTahunAjaran,
  updateTahunAjaran,
  deleteTahunAjaran,
} from "../controllers/tahunAjaran.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/", requireIzin("akademik.view"), getTahunAjaran);
router.post("/", requireIzin("akademik.create"), createTahunAjaran);
router.put("/:id", requireIzin("akademik.update"), updateTahunAjaran);
router.delete("/:id", requireIzin("akademik.delete"), deleteTahunAjaran);

export default router;
