import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import {
  getDataRaportSiswa,
  getKelasWali,
  generateRapot,
  listRapotKelas,
  isiCatatanRapot,
  publishRapot,
  listRapotSaya,
  detailRapotSaya,
} from "../controllers/raport.controller";

const router = Router();

router.use(authenticate);

// Wali kelas (guru; kepemilikan kelas dicek di controller via kelas.waliKelasId)
router.get("/wali-kelas/kelas-saya", authorizeRoles("guru"), getKelasWali);
router.get("/wali-kelas/kelas/:kelasId", authorizeRoles("guru"), listRapotKelas);
router.post(
  "/wali-kelas/kelas/:kelasId/generate",
  authorizeRoles("guru"),
  generateRapot,
);
router.put(
  "/wali-kelas/rapot/:rapotId/catatan",
  authorizeRoles("guru"),
  isiCatatanRapot,
);
router.put(
  "/wali-kelas/rapot/:rapotId/publish",
  authorizeRoles("guru"),
  publishRapot,
);

// Siswa
router.get("/siswa", authorizeRoles("siswa"), listRapotSaya);
router.get("/siswa/:rapotId", authorizeRoles("siswa"), detailRapotSaya);

// Route lama (jangan dibiarkan terbuka; cek kepemilikan di controller)
router.get(
  "/:siswaId/tahun-ajaran/:tahunAjaranId",
  authorizeRoles("guru", "admin_sekolah", "siswa"),
  getDataRaportSiswa,
);

export default router;