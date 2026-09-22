import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { createSiswa, getMySiswa } from "../controllers/siswa.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getMySiswa);

router.post("/", requireTenant, requireIzin("akademik.create"), createSiswa);

export default router;
