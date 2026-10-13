import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { isSuperAdmin } from "../utils/rbac";

export const requireSekolah = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errorCode: "UNAUTHORIZED",
    });
  }

  if (isSuperAdmin(user.role)) {
    return next();
  }

  if (!user.sekolahId) {
    return res.status(403).json({
      success: false,
      message: "Pengguna tidak terhubung dengan sekolah manapun",
      errorCode: "NO_TENANT_LINKED",
    });
  }

  next();
};