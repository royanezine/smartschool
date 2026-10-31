import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
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

router.use(authenticate, requireTenant, requireSubscription);

router.get("/ketersediaan", getKetersediaanAset);
router.get("/", requireIzin("manajemen_aset.view", "peminjaman_aset.view_own"), getDaftarPeminjaman);
router.get("/:id", requireIzin("manajemen_aset.view", "peminjaman_aset.view_own"), getDetailPeminjaman);
router.post("/", requireIzin("manajemen_aset.create", "peminjaman_aset.create_own"), ajukanPeminjaman);
router.patch("/:id/verifikasi", requireIzin("manajemen_aset.update"), verifikasiPengajuan);
router.patch("/:id/serahkan", requireIzin("manajemen_aset.update"), serahkanKeSiswa);
router.patch("/:id/kembalikan", requireIzin("manajemen_aset.update"), kembalikanAset);

export default router;
