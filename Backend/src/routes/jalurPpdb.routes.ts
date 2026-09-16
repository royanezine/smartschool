import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getJalurPpdb,
  getJalurPpdbById,
  createJalurPpdb,
  updateJalurPpdb,
  deleteJalurPpdb,
} from "../controllers/jalurPpdb.controller";

const router = Router();

router.use(authenticate, requireTenant);

router.get("/", requireIzin("ppdb.view"), getJalurPpdb);
router.get("/:id", requireIzin("ppdb.view"), getJalurPpdbById);
router.post("/", requireIzin("ppdb.create"), createJalurPpdb);
router.put("/:id", requireIzin("ppdb.update"), updateJalurPpdb);
router.delete("/:id", requireIzin("ppdb.delete"), deleteJalurPpdb);

export default router;
