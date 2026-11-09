import { Router } from "express";
import {
  register,
  verifyRegister,
  login,
  refreshToken,
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
import { changePassword } from "../controllers/changePassword.controller";
import { requestLimit } from "../middlewares/requestLimit.middleware";

const router = Router();

router.post("/register", requestLimit(10), register);
router.post("/verify-register", requestLimit(10), verifyRegister);
router.post("/login", requestLimit(15), login);
router.post("/refresh", requestLimit(30), refreshToken);
router.post("/logout", authenticate, logout);
router.post("/ubah-kata-sandi", authenticate, requestLimit(10), changePassword);
router.post("/lupa-kata-sandi", requestLimit(5), forgotPassword);
router.post("/atur-ulang-kata-sandi", requestLimit(5), resetPassword);

// Rute Khusus PIN Siswa (Dilindungi rate limit untuk mencegah brute force PIN)
router.post("/pin/setup", requestLimit(10), setupPin);
router.post("/pin/verify", requestLimit(10), verifyPin);
router.post("/pin/forgot", requestLimit(5), forgotPin);
router.post("/pin/lupa", requestLimit(5), forgotPin); // alias lokal
router.post("/pin/reset", requestLimit(5), resetPin);
router.post(
  "/pin/admin-reset/:userId",
  authenticate,
  authorizeRoles("admin_sekolah", "super_admin"),
  resetPinByAdmin,
);

export default router;
