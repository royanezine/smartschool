import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
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

router.use(authenticate);
router.get("/ketersediaan", getKetersediaanAset);
router.get("/", getDaftarPeminjaman);
router.get("/:id", getDetailPeminjaman);
    router.post("/", ajukanPeminjaman);
router.patch("/:id/verifikasi", verifikasiPengajuan);
router.patch("/:id/serahkan", serahkanKeSiswa);
router.patch("/:id/kembalikan", kembalikanAset);

export default router;
