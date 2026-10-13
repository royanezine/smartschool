import { Router } from "express";
import {
  getPengaturanSekolah,
  upsertPengaturanSekolah,
} from "../controllers/pengaturanSistem.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { getKkm, setKkm } from "../controllers/kkm.controller";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("super_admin", "admin_sekolah", "admin_yayasan"));

router.get("/", getPengaturanSekolah);
router.post("/", upsertPengaturanSekolah);

router.get("/kkm", authenticate, authorizeRoles("admin_sekolah"), getKkm);
router.post("/kkm", authenticate, authorizeRoles("admin_sekolah"), setKkm);

export default router;
