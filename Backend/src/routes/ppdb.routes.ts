import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { validate } from "../middlewares/validation.middleware";

import {
  daftarPpdb,
  uploadBerkasPpdb,
  verifikasiPpdb,
} from "../controllers/ppdb.controller";

import { uploadPpdb } from "../middlewares/uploadPpdb.middleware";

import { pendaftaranPpdbSchema } from "../validations/ppdb.validation";
import { getPendaftar, getDetailPendaftar, getStatistikPendaftar } from "../controllers/pendaftar.controller";

const router = Router();

const readPendaftar = [authenticate, requireTenant, requireSubscription, requireIzin("ppdb.view")];
router.get("/pendaftar", ...readPendaftar, getPendaftar);
router.get("/pendaftar/statistik", ...readPendaftar, getStatistikPendaftar);
router.get("/pendaftar/:id", ...readPendaftar, getDetailPendaftar);

// PUBLIC
router.post(
  "/daftar",
  validate(pendaftaranPpdbSchema),
  daftarPpdb
);

router.post(
  "/:id/berkas",
  uploadPpdb.single("file"),
  uploadBerkasPpdb
);

// ADMIN SEKOLAH
router.patch(
  "/:id/verifikasi",
  authenticate,
  requireTenant,
  requireSubscription,
  requireIzin("ppdb.update"),
  verifikasiPpdb
);

export default router;
