import { Router } from "express";
import {
  getPengaturanSekolah,
  upsertPengaturanSekolah,
} from "../controllers/pengaturanSistem.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("super_admin", "admin_sekolah", "admin_yayasan"));

router.get("/", getPengaturanSekolah);
router.post("/", upsertPengaturanSekolah);

export default router;
