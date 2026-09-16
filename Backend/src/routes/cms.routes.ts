import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createKategoriArtikel,
  getKategoriArtikel,
  updateKategoriArtikel,
  deleteKategoriArtikel,
  createArtikelCms,
  getArtikelCms,
  updateArtikelCms,
  deleteArtikelCms,
  createHalamanCms,
  getHalamanCms,
  updateHalamanCms,
  deleteHalamanCms,
} from "../controllers/cms.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post(
  "/kategori-artikel",
  requireIzin("cms.create"),
  createKategoriArtikel,
);
router.get("/kategori-artikel", requireIzin("cms.view"), getKategoriArtikel);
router.put(
  "/kategori-artikel/:id",
  requireIzin("cms.update"),
  updateKategoriArtikel,
);
router.delete(
  "/kategori-artikel/:id",
  requireIzin("cms.delete"),
  deleteKategoriArtikel,
);

router.post("/artikel", requireIzin("cms.create"), createArtikelCms);
router.get("/artikel", requireIzin("cms.view"), getArtikelCms);
router.put("/artikel/:id", requireIzin("cms.update"), updateArtikelCms);
router.delete("/artikel/:id", requireIzin("cms.delete"), deleteArtikelCms);

router.post("/halaman", requireIzin("cms.create"), createHalamanCms);
router.get("/halaman", requireIzin("cms.view"), getHalamanCms);
router.put("/halaman/:id", requireIzin("cms.update"), updateHalamanCms);
router.delete("/halaman/:id", requireIzin("cms.delete"), deleteHalamanCms);

export default router;
