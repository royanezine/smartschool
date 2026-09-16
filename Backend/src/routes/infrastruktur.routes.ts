import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getGedung,
  createGedung,
  updateGedung,
  deleteGedung,
  getLantaiByGedung,
  createLantai,
  updateLantai,
  deleteLantai,
} from "../controllers/infrastruktur.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/gedung", requireIzin("manajemen_aset.view"), getGedung);
router.post("/gedung", requireIzin("manajemen_aset.create"), createGedung);
router.put("/gedung/:id", requireIzin("manajemen_aset.update"), updateGedung);
router.delete(
  "/gedung/:id",
  requireIzin("manajemen_aset.delete"),
  deleteGedung,
);

router.get(
  "/lantai/gedung/:gedungId",
  requireIzin("manajemen_aset.view"),
  getLantaiByGedung,
);
router.post("/lantai", requireIzin("manajemen_aset.create"), createLantai);
router.put("/lantai/:id", requireIzin("manajemen_aset.update"), updateLantai);
router.delete(
  "/lantai/:id",
  requireIzin("manajemen_aset.delete"),
  deleteLantai,
);

export default router;
