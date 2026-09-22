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

router.get("/profile", authenticate, profile);

router.put("/profile", authenticate, updateProfile);

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
