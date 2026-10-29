import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  getGelombangPpdb, getGelombangPpdbById, createGelombangPpdb,
  updateGelombangPpdb, deleteGelombangPpdb,
} from "../controllers/gelombangPpdb.controller";

const router = Router();
router.use(authenticate, requireTenant, requireSubscription);
router.get("/", requireIzin("ppdb.view"), getGelombangPpdb);
router.get("/:id", requireIzin("ppdb.view"), getGelombangPpdbById);
router.post("/", requireIzin("ppdb.create"), createGelombangPpdb);
router.put("/:id", requireIzin("ppdb.update"), updateGelombangPpdb);
router.delete("/:id", requireIzin("ppdb.delete"), deleteGelombangPpdb);
export default router;
