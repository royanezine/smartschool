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

// === KETERSEDIAAN ASET (Bisa diakses Siswa, Guru, Staff) ===
router.get("/peminjaman/ketersediaan", getKetersediaanAset);

// === ALUR PEMINJAMAN ASET ===
router.post("/peminjaman", requireIzin("manajemen_aset.create"), ajukanPeminjaman);
router.get("/peminjaman", requireIzin("manajemen_aset.view"), getDaftarPeminjaman);
router.get("/peminjaman/:id", requireIzin("manajemen_aset.view"), getDetailPeminjaman);
router.patch("/peminjaman/:id/persetujuan", requireIzin("manajemen_aset.update"), verifikasiPengajuan);
router.patch("/peminjaman/:id/ambil", requireIzin("manajemen_aset.update"), serahkanKeSiswa);
router.patch("/peminjaman/:id/kembali", requireIzin("manajemen_aset.update"), kembalikanAset);

// === INVENTARIS GUDANG ===
router.post("/gudang", requireIzin("manajemen_aset.create"), createGudang);
router.get("/gudang", requireIzin("manajemen_aset.view"), getGudang);
router.put("/gudang/:id", requireIzin("manajemen_aset.update"), updateGudang);
router.delete("/gudang/:id", requireIzin("manajemen_aset.delete"), deleteGudang);

// === KATEGORI ASET ===
router.post("/kategori", requireIzin("manajemen_aset.create"), createKategoriAset);
router.get("/kategori", requireIzin("manajemen_aset.view"), getKategoriAset);
router.put("/kategori/:id", requireIzin("manajemen_aset.update"), updateKategoriAset);
router.delete("/kategori/:id", requireIzin("manajemen_aset.delete"), deleteKategoriAset);

// === DATA ASET ===
router.post("/aset", requireIzin("manajemen_aset.create"), createAset);
router.get("/aset", requireIzin("manajemen_aset.view"), getAset);
router.put("/aset/:id", requireIzin("manajemen_aset.update"), updateAset);
router.delete("/aset/:id", requireIzin("manajemen_aset.delete"), deleteAset);

export default router;