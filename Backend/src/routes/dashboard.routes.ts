import { Router } from "express";
import { getDashboardSekolah } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeRoles("super_admin", "admin_yayasan", "admin_sekolah", "guru", "siswa"),
  getDashboardSekolah,
);

export default router;