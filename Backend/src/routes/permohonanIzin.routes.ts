import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { uploadBuktiIzin } from "../middlewares/upload.middleware";
import {
  ajukanIzin,
  getDaftarIzin,
  verifikasiIzin,
} from "../controllers/permohonanIzin.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.post("/", uploadBuktiIzin.single("bukti"), ajukanIzin);

router.get("/", getDaftarIzin);
router.patch(
  "/:id/verifikasi",
  authorizeRoles("super_admin", "admin_sekolah", "guru"),
  verifikasiIzin,
);

export default router;