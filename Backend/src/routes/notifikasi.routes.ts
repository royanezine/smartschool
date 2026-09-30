import { Router } from "express";
import {
  getNotifikasiUser,
  markAsRead,
  markAllAsRead,
  createBroadcastPengumuman, // <-- Import ini
} from "../controllers/notifikasi.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getNotifikasiUser);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.post(
  "/broadcast",
  authorizeRoles("admin_sekolah", "super_admin"),
  createBroadcastPengumuman,
);
export default router;
