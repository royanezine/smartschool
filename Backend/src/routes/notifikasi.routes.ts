import { Router } from "express";
import {
  getNotifikasiUser,
  markAsRead,
  markAllAsRead,
} from "../controllers/notifikasi.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getNotifikasiUser);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
