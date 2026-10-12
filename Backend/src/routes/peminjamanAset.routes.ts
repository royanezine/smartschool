import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  ajukanPeminjaman,
  verifikasiPengajuan,
  serahkanKeSiswa,
  kembalikanAset,
  getKetersediaanAset,
  getDaftarPeminjaman,
  getDetailPeminjaman,
} from "../controllers/peminjamanAset.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/ketersediaan", getKetersediaanAset);
router.get("/", requireIzin("manajemen_aset.view"), getDaftarPeminjaman);
router.get("/:id", requireIzin("manajemen_aset.view"), getDetailPeminjaman);
router.post("/", requireIzin("manajemen_aset.create"), ajukanPeminjaman);
router.patch("/:id/verifikasi", requireIzin("manajemen_aset.update"), verifikasiPengajuan);
router.patch("/:id/serahkan", requireIzin("manajemen_aset.update"), serahkanKeSiswa);
router.patch("/:id/kembalikan", requireIzin("manajemen_aset.update"), kembalikanAset);

export default router;
