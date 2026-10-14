import { Router } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";
import { KEUANGAN_READ, KEUANGAN_WRITE } from "../utils/keuangan.roles";
import {
  listKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  listTarif,
  createTarif,
  updateTarif,
  deleteTarif,
} from "../controllers/Tarif.controller";

const router = Router();

router.get("/kategori-tagihan", authorizeRoles(...KEUANGAN_READ), listKategori);
router.post("/kategori-tagihan", authorizeRoles(...KEUANGAN_WRITE), createKategori);
router.put("/kategori-tagihan/:id", authorizeRoles(...KEUANGAN_WRITE), updateKategori);
router.delete("/kategori-tagihan/:id", authorizeRoles(...KEUANGAN_WRITE), deleteKategori);

router.get("/tarif", authorizeRoles(...KEUANGAN_READ), listTarif);
router.post("/tarif", authorizeRoles(...KEUANGAN_WRITE), createTarif);
router.put("/tarif/:id", authorizeRoles(...KEUANGAN_WRITE), updateTarif);
router.delete("/tarif/:id", authorizeRoles(...KEUANGAN_WRITE), deleteTarif);

export default router;