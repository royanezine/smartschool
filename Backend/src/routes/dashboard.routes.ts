import { Router } from "express";
import { getDashboardSekolah } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getDashboardSekolah);

export default router;