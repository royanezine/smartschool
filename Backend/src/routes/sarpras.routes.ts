import { Router } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireLangganan } from "../middlewares/langganan.middleware";
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
  createRuangan,
  getRuangan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/sarpras.controller";
import { getKetersediaanAset } from "../controllers/peminjamanAset.controller";

const router = Router();

router.use(authenticate, requireTenant, requireLangganan());

router.post("/gudang", requireIzin("manajemen_aset.create"), createGudang);
router.get("/gudang", requireIzin("manajemen_aset.view"), getGudang);
router.put("/gudang/:id", requireIzin("manajemen_aset.update"), updateGudang);
router.delete("/gudang/:id", requireIzin("manajemen_aset.delete"), deleteGudang);

router.post("/kategori", requireIzin("manajemen_aset.create"), createKategoriAset);
router.get("/kategori", requireIzin("manajemen_aset.view"), getKategoriAset);
router.put("/kategori/:id", requireIzin("manajemen_aset.update"), updateKategoriAset);
router.delete("/kategori/:id", requireIzin("manajemen_aset.delete"), deleteKategoriAset);

router.post("/ruangan", requireIzin("manajemen_aset.create"), createRuangan);
router.get("/ruangan", requireIzin("manajemen_aset.view"), getRuangan);
router.put("/ruangan/:id", requireIzin("manajemen_aset.update"), updateRuangan);
router.delete("/ruangan/:id", requireIzin("manajemen_aset.delete"), deleteRuangan);

router.post("/aset", requireIzin("manajemen_aset.create"), createAset);
router.get("/aset", requireIzin("manajemen_aset.view", "peminjaman_aset.view_own"), (req, res, next) => {
  const user = (req as AuthRequest).user;
  if (user?.izin.includes("manajemen_aset.view") || user?.role === "super_admin") {
    return getAset(req, res, next);
  }
  return getKetersediaanAset(req, res, next);
});
router.put("/aset/:id", requireIzin("manajemen_aset.update"), updateAset);
router.delete("/aset/:id", requireIzin("manajemen_aset.delete"), deleteAset);

export default router;