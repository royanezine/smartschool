import { Router } from "express";
import {
  exportRekapNilai,
  getKelasSaya,
  getKomponenNilaiByMapel,
  createKomponenNilai,
  getGridNilai,
  inputNilaiBulk,
  finalisasiNilai,
  tarikSumberNilai,
  importNilaiExcel,
} from "../controllers/nilai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { uploadNilaiExcel } from "../middlewares/upload.middleware";
import { tarikSumberNilaiSchema, validateImportNilaiExcel } from "../validations/nilai.validation";
import { validate } from "../middlewares/validation.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/tarik-sumber",
  authorizeRoles("guru"),
  validate(tarikSumberNilaiSchema),
  tarikSumberNilai,
);

router.post(
  "/import-excel",
  authorizeRoles("guru"),
  uploadNilaiExcel.single("file"),
  validateImportNilaiExcel,
  importNilaiExcel,
);

router.get("/export", authorizeRoles("admin_sekolah", "guru"), exportRekapNilai);

router.get("/kelas-saya", authorizeRoles("guru"), getKelasSaya);

router.get(
  "/komponen/:kelasMapelId",
  authorizeRoles("guru"),
  getKomponenNilaiByMapel,
);
router.post("/komponen", authorizeRoles("guru"), createKomponenNilai);

router.get("/input/:kelasMapelId", authorizeRoles("guru"), getGridNilai);
router.post("/input/bulk", authorizeRoles("guru"), inputNilaiBulk);

router.post(
  "/finalisasi/:kelasMapelId",
  authorizeRoles("guru"),
  finalisasiNilai,
);

export default router;