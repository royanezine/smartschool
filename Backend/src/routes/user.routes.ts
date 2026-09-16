import { Router } from "express";
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
} from "../controllers/user.controller";

const router = Router();

// PROFILE
router.get("/profile", authenticate, requireTenant, profile);
router.put("/profile", authenticate, requireTenant, updateProfile);

// CRUD USER
router.get("/", authenticate, requireIzin("manajemen_pengguna.view"), getUsers);
router.get(
  "/:id",
  authenticate,
  requireIzin("manajemen_pengguna.view"),
  getUserById,
);
router.post(
  "/",
  authenticate,
  requireIzin("manajemen_pengguna.create"),
  createUser,
);
router.put(
  "/:id",
  authenticate,
  requireIzin("manajemen_pengguna.update"),
  updateUser,
);
router.delete(
  "/:id",
  authenticate,
  requireIzin("manajemen_pengguna.delete"),
  deleteUser,
);

export default router;
