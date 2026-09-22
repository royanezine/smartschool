import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { isSuperAdmin } from "../utils/rbac";

export const requireIzin = (...izinWajib: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: belum login",
      });
    }

    if (isSuperAdmin(user.role)) {
      return next();
    }

    const userPermissions = user.izin ?? [];

    const lolos = izinWajib.some((izin) => userPermissions.includes(izin));

    if (!lolos) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: butuh izin ${izinWajib.join(" atau ")}`,
      });
    }

    next();
  };
};

export const requireModul = (kodeModul: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: belum login",
      });
    }

    if (isSuperAdmin(user.role)) {
      return next();
    }

    const modulAktif = user.modulAktif ?? [];

    if (!modulAktif.includes(kodeModul)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: modul "${kodeModul}" tidak aktif untuk sekolah ini`,
      });
    }

    next();
  };
};
