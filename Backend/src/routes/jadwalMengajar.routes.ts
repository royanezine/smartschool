import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getJadwalMengajar,
  getJadwalMengajarById,
  createJadwalMengajar,
  updateJadwalMengajar,
  deleteJadwalMengajar,
} from "../controllers/jadwalMengajar.controller";
import {
  createJadwalMengajarSchema,
  updateJadwalMengajarSchema,
} from "../validations/jadwalMengajar.validation";

const router = Router();

const validate = (schema: any) => (req: any, res: any, next: any) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: result.error.flatten(),
    });
  }
  req.body = result.data;
  next();
};

router.use(authenticate, requireTenant);

router.get("/", requireIzin("akademik.view"), getJadwalMengajar);
router.get("/:id", requireIzin("akademik.view"), getJadwalMengajarById);
router.post(
  "/",
  requireIzin("akademik.create"),
  validate(createJadwalMengajarSchema),
  createJadwalMengajar,
);
router.put(
  "/:id",
  requireIzin("akademik.update"),
  validate(updateJadwalMengajarSchema),
  updateJadwalMengajar,
);
router.delete("/:id", requireIzin("akademik.delete"), deleteJadwalMengajar);

export default router;
