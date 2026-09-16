import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  daftarPpdb,
  uploadBerkasPpdb,
  verifikasiPpdb,
} from "../controllers/ppdb.controller";
import { uploadPpdb } from "../middlewares/uploadPpdb.middleware";

const router = Router();

// PUBLIC
router.post("/daftar", daftarPpdb);
router.post("/:id/berkas", uploadPpdb.single("file"), uploadBerkasPpdb);

// ADMIN SEKOLAH
router.patch(
  "/:id/verifikasi",
  authenticate,
  requireTenant,
  requireIzin("ppdb.update"),
  verifikasiPpdb,
);

export default router;
