import { Router } from "express";
import {
  register,
  verifyRegister,
  login,
  logout,
  forgotPassword,
  resetPassword,
  setupPin,
  verifyPin,
  forgotPin,
  resetPin,
  resetPinByAdmin,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.post("/register", register);
router.post("/verify-register", verifyRegister);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.post("/lupa-kata-sandi", forgotPassword);
router.post("/atur-ulang-kata-sandi", resetPassword);

// Rute Khusus PIN Siswa
router.post("/pin/setup", setupPin);
router.post("/pin/verify", verifyPin);
router.post("/pin/forgot", forgotPin);
router.post("/pin/lupa", forgotPin); // alias lokal
router.post("/pin/reset", resetPin);
router.post(
  "/pin/admin-reset/:userId",
  authenticate,
  authorizeRoles("admin_sekolah", "super_admin"),
  resetPinByAdmin,
);

export default router;
