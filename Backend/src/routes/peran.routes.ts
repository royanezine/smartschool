import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getIzin,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/peran.controller";

const router = Router();

router.use(authenticate);

router.get("/izin", requireIzin("manajemen_pengguna.view"), getIzin);

router.get("/", requireIzin("manajemen_pengguna.view"), getRoles);

router.get("/:id", requireIzin("manajemen_pengguna.view"), getRoleById);

router.post("/", requireIzin("manajemen_pengguna.create"), createRole);

router.put("/:id", requireIzin("manajemen_pengguna.update"), updateRole);

router.delete("/:id", requireIzin("manajemen_pengguna.delete"), deleteRole);

export default router;
