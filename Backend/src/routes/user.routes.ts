import { Router } from "express";
import { ownReview } from "../controllers/review.controller";
import { authorizeRoles } from "../middlewares/role.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";

import {
  profile,
  updateProfile,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  quickResetPassword,
} from "../controllers/user.controller";

const router = Router();
router.get("/review", authenticate, authorizeRoles("admin_yayasan", "admin_sekolah"), ownReview);
router.post("/review", authenticate, authorizeRoles("admin_yayasan", "admin_sekolah"), ownReview);
router.put("/review", authenticate, authorizeRoles("admin_yayasan", "admin_sekolah"), ownReview);

router.get("/profile", authenticate, profile);
router.put("/profile", authenticate, updateProfile);
router.get("/", authenticate, requireIzin("manajemen_pengguna.view"), getUsers);
router.patch(
  "/:id/reset-password",
  authenticate,
  requireIzin("manajemen_pengguna.update"),
  quickResetPassword,
);

router.get(
  "/:id",
  authenticate,
  requireIzin("manajemen_pengguna.view"),
  getUserById,
);

router.post(
  "/",
  authenticate,
  requireTenant,
  requireIzin("manajemen_pengguna.create"),
  createUser,
);

router.put(
  "/:id",
  authenticate,
  requireTenant,
  requireIzin("manajemen_pengguna.update"),
  updateUser,
);

router.delete(
  "/:id",
  authenticate,
  requireTenant,
  requireIzin("manajemen_pengguna.delete"),
  deleteUser,
);

export default router;
