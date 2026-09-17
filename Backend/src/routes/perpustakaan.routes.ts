import { Router } from "express";

import {
  getBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
  pinjamBuku,
  kembalikanBuku,
  getPeminjaman,
} from "../controllers/perpustakaan.controller";

import {
  createBukuSchema,
  updateBukuSchema,
  peminjamanBukuSchema,
  pengembalianBukuSchema,
} from "../validations/perpustakaan.validation";

import { validate } from "../middlewares/validation.middleware";
import { requireSekolah } from "../middlewares/perpustakaan.middleware";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(requireSekolah);

router.get("/buku", getBuku);

router.get("/buku/:id", getBukuById);

router.post(
  "/buku",
  validate(createBukuSchema),
  createBuku
);

router.put(
  "/buku/:id",
  validate(updateBukuSchema),
  updateBuku
);

router.delete(
  "/buku/:id",
  deleteBuku
);

router.get(
  "/peminjaman",
  getPeminjaman
);

router.post(
  "/peminjaman",
  validate(peminjamanBukuSchema),
  pinjamBuku
);

router.put(
  "/peminjaman/:id/kembali",
  validate(pengembalianBukuSchema),
  kembalikanBuku
);

export default router;