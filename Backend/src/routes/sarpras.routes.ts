import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createGudang,
  getGudang,
  updateGudang,
  deleteGudang,
  createKategoriAset,
  getKategoriAset,
  updateKategoriAset,
  deleteKategoriAset,
  createAset,
  getAset,
  updateAset,
  deleteAset,
} from "../controllers/sarpras.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post("/gudang", requireIzin("manajemen_aset.create"), createGudang);
router.get("/gudang", requireIzin("manajemen_aset.view"), getGudang);
router.put("/gudang/:id", requireIzin("manajemen_aset.update"), updateGudang);
router.delete(
  "/gudang/:id",
  requireIzin("manajemen_aset.delete"),
  deleteGudang,
);

router.post(
  "/kategori",
  requireIzin("manajemen_aset.create"),
  createKategoriAset,
);
router.get("/kategori", requireIzin("manajemen_aset.view"), getKategoriAset);
router.put(
  "/kategori/:id",
  requireIzin("manajemen_aset.update"),
  updateKategoriAset,
);
router.delete(
  "/kategori/:id",
  requireIzin("manajemen_aset.delete"),
  deleteKategoriAset,
);

router.post("/aset", requireIzin("manajemen_aset.create"), createAset);
router.get("/aset", requireIzin("manajemen_aset.view"), getAset);
router.put("/aset/:id", requireIzin("manajemen_aset.update"), updateAset);
router.delete("/aset/:id", requireIzin("manajemen_aset.delete"), deleteAset);

export default router;
