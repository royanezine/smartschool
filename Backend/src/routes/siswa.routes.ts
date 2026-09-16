import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { createSiswa } from "../controllers/siswa.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post("/", requireIzin("akademik.create"), createSiswa);

export default router;
