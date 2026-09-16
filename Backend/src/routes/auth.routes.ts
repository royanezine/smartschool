import { Router } from "express";
import {
  register,
  verifyRegister,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/verify-register", verifyRegister);
router.post("/login", login);
router.post("/lupa-kata-sandi", forgotPassword);
router.post("/atur-ulang-kata-sandi", resetPassword);

export default router;
