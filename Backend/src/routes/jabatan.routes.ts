import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireAksesMenu } from "../middlewares/aksesMenu.middleware";
import {
  getMenuBaku,
  getAllJabatan,
  getJabatanById,
  createJabatan,
  updateJabatan,
  deleteJabatan,
} from "../controllers/jabatan.controller";

const router = Router();

// Wajib terautentikasi dan memiliki langganan aktif untuk semua endpoint jabatan
router.use(authenticate, requireTenant, requireSubscription);

// Endpoint referensi publik/internal (cukup otentikasi dasar untuk dropdown assign pegawai di frontend)
router.get("/menu-baku", getMenuBaku);
router.get("/", getAllJabatan);

// Endpoint manajemen jabatan: Dilindungi requireAksesMenu("manajemen pengguna", "update") (atau Super Admin)
router.get(
  "/:id",
  requireAksesMenu("manajemen pengguna", "update"),
  getJabatanById,
);
router.post(
  "/",
  requireAksesMenu("manajemen pengguna", "update"),
  createJabatan,
);
router.put(
  "/:id",
  requireAksesMenu("manajemen pengguna", "update"),
  updateJabatan,
);
router.delete(
  "/:id",
  requireAksesMenu("manajemen pengguna", "update"),
  deleteJabatan,
);

export default router;

