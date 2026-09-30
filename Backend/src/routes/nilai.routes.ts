import { Router } from "express";
import {
  exportRekapNilai,
  getKomponenNilaiByMapel,
  inputNilai,
} from "../controllers/nilai.controller";
import { createKomponenNilai } from "../controllers/raport.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/export", exportRekapNilai);

router.post(
  "/komponen",
  authorizeRoles("guru", "admin_sekolah"),
  createKomponenNilai,
);
router.get("/komponen/:kelasMapelId", getKomponenNilaiByMapel);
router.post("/input", authorizeRoles("guru"), inputNilai);

export default router;
