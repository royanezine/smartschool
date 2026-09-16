import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { exportRekapNilai } from "../controllers/nilai.controller";

const router = Router();

router.get(
  "/export",
  authenticate,
  requireTenant,
  requireIzin("laporan.view"),
  exportRekapNilai,
);

export default router;
