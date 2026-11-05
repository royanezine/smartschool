import { Router } from "express";
import { getKota, getProvinsi } from "../controllers/wilayah.controller";
import { requestLimit } from "../middlewares/requestLimit.middleware";

const router = Router();

router.use(requestLimit(120, 60 * 1000));

router.get("/provinsi", getProvinsi);
router.get("/kota", getKota);
router.get("/kota/:provinsiId", getKota);

export default router;