import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getDataRaportSiswa } from "../controllers/raport.controller";

const router = Router();

router.get(
  "/:siswaId/tahun-ajaran/:tahunAjaranId",
  authenticate,
  getDataRaportSiswa,
);

export default router;
