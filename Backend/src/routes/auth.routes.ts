import { Router } from "express";
import {
  register,
  verifyRegister,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/verify-register", verifyRegister);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.post("/lupa-kata-sandi", forgotPassword);
router.post("/atur-ulang-kata-sandi", resetPassword);

export default router;
