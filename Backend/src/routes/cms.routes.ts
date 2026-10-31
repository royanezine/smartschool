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
  getTemaWarna,
  updateTemaWarna,
  resetTemaWarna,
  getMenuKonfigurasi,
  upsertMenuKonfigurasi,
  deleteMenuKonfigurasi,
} from "../controllers/cms.controller";

const router = Router();

router.use(authenticate);
router.get("/tema", getTemaWarna);
router.use(requireTenant);
router.put("/tema", requireIzin("cms.update"), updateTemaWarna);
router.delete("/tema", requireIzin("cms.delete"), resetTemaWarna);

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

router.get("/menu-konfigurasi", requireIzin("cms.view"), getMenuKonfigurasi);
router.post("/menu-konfigurasi", requireIzin("cms.create"), upsertMenuKonfigurasi);
router.put("/menu-konfigurasi/:id", requireIzin("cms.update"), upsertMenuKonfigurasi);
router.delete("/menu-konfigurasi/:id", requireIzin("cms.delete"), deleteMenuKonfigurasi);

export default router;
