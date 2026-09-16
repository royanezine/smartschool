import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createTugas,
  getTugasByKelasMapel,
  getDetailTugas,
  updateTugas,
  deleteTugas,
  submitTugas,
  getPengumpulanByTugas,
  beriNilaiTugas,
} from "../controllers/tugas.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.post("/", requireIzin("tugas.create"), createTugas);
router.put("/:id", requireIzin("tugas.update"), updateTugas);
router.delete("/:id", requireIzin("tugas.delete"), deleteTugas);
router.get(
  "/:id/pengumpulan",
  requireIzin("tugas.view"),
  getPengumpulanByTugas,
);
router.patch(
  "/pengumpulan/:pengumpulanId/nilai",
  requireIzin("tugas.update"),
  beriNilaiTugas,
);

router.get(
  "/kelas-mapel/:kelasMapelId",
  requireIzin("tugas.view"),
  getTugasByKelasMapel,
);
router.get("/:id", requireIzin("tugas.view"), getDetailTugas);
router.post("/:id/submit", requireIzin("tugas.view"), submitTugas);

export default router;
