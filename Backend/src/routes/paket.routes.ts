import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getPaketPublic,
  getPaketPublicById,
  getFiturPublic,
  createPaket,
  updatePaket,
  deletePaket,
} from "../controllers/paket.controller";

const router = Router();

// PUBLIC
router.get("/fitur/list", getFiturPublic);
router.get("/", getPaketPublic);
router.get("/:id", getPaketPublicById);

// SUPER ADMIN
router.post("/", authenticate, requireIzin("paket.create"), createPaket);
router.put("/:id", authenticate, requireIzin("paket.update"), updatePaket);
router.delete("/:id", authenticate, requireIzin("paket.delete"), deletePaket);

export default router;
