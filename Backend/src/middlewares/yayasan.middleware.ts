import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { normalizeRole } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";

export const hanyaAdminYayasan = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as AuthRequest).user;

  if (!user || normalizeRole(user.role) !== "admin_yayasan" || !user.yayasanId) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: hanya Admin Yayasan yang dapat mengakses fitur ini",
      errorCode: "FORBIDDEN_YAYASAN_ONLY",
    });
  }

  next();
};

export const wajibLanggananYayasan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as AuthRequest).user;

    if (!user?.yayasanId) {
      return res.status(403).json({
        success: false,
        message: "Akun tidak terhubung dengan yayasan",
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const { aktif } = await cekLanggananYayasan(user.yayasanId);

    if (!aktif) {
      return res.status(403).json({
        success: false,
        message: "Langganan yayasan tidak aktif atau telah berakhir",
        errorCode: "YAYASAN_SUBSCRIPTION_INACTIVE",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};