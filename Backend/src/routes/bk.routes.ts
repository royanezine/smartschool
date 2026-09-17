import { Router } from "express";
import {
  getSesiKonseling,
  getSesiKonselingById,
  createSesiKonseling,
  updateSesiKonseling,
  deleteSesiKonseling,
  getKategoriPelanggaran,
  createKategoriPelanggaran,
  updateKategoriPelanggaran,
  deleteKategoriPelanggaran,
  getPelanggaranSiswa,
  createPelanggaranSiswa,
  updatePelanggaranSiswa,
  deletePelanggaranSiswa,
  getAsesmenMinatBakat,
  createAsesmenMinatBakat,
  updateAsesmenMinatBakat,
  deleteAsesmenMinatBakat,
} from "../controllers/bk.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/konseling", getSesiKonseling);
router.get("/konseling/:id", getSesiKonselingById);
router.post("/konseling", createSesiKonseling);
router.put("/konseling/:id", updateSesiKonseling);
router.delete("/konseling/:id", deleteSesiKonseling);

router.get("/kategori-pelanggaran", getKategoriPelanggaran);
router.post("/kategori-pelanggaran", createKategoriPelanggaran);
router.put("/kategori-pelanggaran/:id", updateKategoriPelanggaran);
router.delete("/kategori-pelanggaran/:id", deleteKategoriPelanggaran);

router.get("/pelanggaran", getPelanggaranSiswa);
router.post("/pelanggaran", createPelanggaranSiswa);
router.put("/pelanggaran/:id", updatePelanggaranSiswa);
router.delete("/pelanggaran/:id", deletePelanggaranSiswa);

router.get("/asesmen-minat-bakat", getAsesmenMinatBakat);
router.post("/asesmen-minat-bakat", createAsesmenMinatBakat);
router.put("/asesmen-minat-bakat/:id", updateAsesmenMinatBakat);
router.delete("/asesmen-minat-bakat/:id", deleteAsesmenMinatBakat);

export default router;