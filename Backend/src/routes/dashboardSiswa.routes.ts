import { Router } from "express";
import { getDashboardSiswa } from "../controllers/dashboardSiswa.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authenticate, authorizeRoles("siswa"), getDashboardSiswa);

export default router;