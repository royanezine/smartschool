import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import {
  requireTenant,
  requireSubscription,
} from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { validate } from "../middlewares/validation.middleware";
import { authenticatePendaftar } from "../middlewares/ppdbAuth.middleware";

import {
  daftarPpdb,
  uploadBerkasPpdb,
  verifikasiPpdb,
} from "../controllers/ppdb.controller";

import {
  opsiPendaftaran,
  loginPendaftar,
  detailSaya,
  rankingSaya,
  ambilPengaturan,
  ubahPengaturan,
  daftarJalurAdmin,
  buatJalur,
  ubahJalur,
  rankingAdmin,
} from "../controllers/spmb.controller";

import { uploadPpdb } from "../middlewares/uploadPpdb.middleware";

import {
  pendaftaranPpdbSchema,
  loginPendaftarSchema,
  pengaturanSpmbSchema,
  jalurSpmbSchema,
  jalurSpmbUbahSchema,
} from "../validations/ppdb.validation";
import {
  getPendaftar,
  getDetailPendaftar,
  getStatistikPendaftar,
} from "../controllers/pendaftar.controller";

const router = Router();

const tenantBase = [authenticate, requireTenant, requireSubscription];
const bacaPpdb = [...tenantBase, requireIzin("ppdb.view")];
const ubahPpdb = [...tenantBase, requireIzin("ppdb.update")];
const buatPpdb = [...tenantBase, requireIzin("ppdb.create")];

router.get("/sekolah/:sekolahId/opsi", opsiPendaftaran);

router.post("/daftar", validate(pendaftaranPpdbSchema), daftarPpdb);

router.post("/login", validate(loginPendaftarSchema), loginPendaftar);

router.get("/saya", authenticatePendaftar, detailSaya);
router.get("/saya/ranking", authenticatePendaftar, rankingSaya);

router.get("/pendaftar", ...bacaPpdb, getPendaftar);
router.get("/pendaftar/statistik", ...bacaPpdb, getStatistikPendaftar);
router.get("/pendaftar/:id", ...bacaPpdb, getDetailPendaftar);

router.get("/pengaturan", ...bacaPpdb, ambilPengaturan);
router.patch(
  "/pengaturan",
  ...ubahPpdb,
  validate(pengaturanSpmbSchema),
  ubahPengaturan,
);

router.get("/jalur", ...bacaPpdb, daftarJalurAdmin);
router.post("/jalur", ...buatPpdb, validate(jalurSpmbSchema), buatJalur);
router.patch(
  "/jalur/:id",
  ...ubahPpdb,
  validate(jalurSpmbUbahSchema),
  ubahJalur,
);
router.get("/jalur/:id/ranking", ...bacaPpdb, rankingAdmin);

router.post("/:id/berkas", uploadPpdb.single("file"), uploadBerkasPpdb);

router.patch("/:id/verifikasi", ...ubahPpdb, verifikasiPpdb);

export default router;