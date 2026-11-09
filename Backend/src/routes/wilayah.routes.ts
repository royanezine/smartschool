import { Router } from "express";
import {
  getKota,
  getProvinsi,
  getKecamatan,
  getKelurahan,
} from "../controllers/wilayah.controller";
import { requestLimit } from "../middlewares/requestLimit.middleware";

const router = Router();

router.use(requestLimit(120, 60 * 1000));

router.get("/provinsi", getProvinsi);
router.get("/kota", getKota);
router.get("/kota/:provinsiId", getKota);
router.get("/kecamatan", getKecamatan);
router.get("/kecamatan/:kotaId", getKecamatan);
router.get("/kelurahan", getKelurahan);
router.get("/kelurahan/:kecamatanId", getKelurahan);

export default router;