import { Router } from "express";
import {
  exportRekapNilai,
  getKelasSaya,
  getKomponenNilaiByMapel,
  createKomponenNilai,
  getGridNilai,
  inputNilaiBulk,
  finalisasiNilai,
} from "../controllers/nilai.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/export", exportRekapNilai);

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