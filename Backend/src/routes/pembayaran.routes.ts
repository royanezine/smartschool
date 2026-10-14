import { Router } from "express";
import { authorizeRoles } from "../middlewares/role.middleware";
import { KEUANGAN_READ, KEUANGAN_WRITE } from "../utils/keuangan.roles";
import {
  bayarTagihan,
  listPembayaran,
  detailPembayaran,
  batalkanPembayaran,
} from "../controllers/pembayaran.controller";

const router = Router();

router.post("/pembayaran", authorizeRoles(...KEUANGAN_WRITE), bayarTagihan);
router.get("/pembayaran", authorizeRoles(...KEUANGAN_READ), listPembayaran);
router.get("/pembayaran/:id", authorizeRoles(...KEUANGAN_READ), detailPembayaran);
router.post("/pembayaran/:id/batal", authorizeRoles(...KEUANGAN_WRITE), batalkanPembayaran);

export default router;