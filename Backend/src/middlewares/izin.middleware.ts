import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

// cek izin user
export const requireIzin = (...izinWajib: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: belum login",
      });
    }

    const lolos = izinWajib.some((izin) => user.izin.includes(izin));

    if (!lolos) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: butuh izin ${izinWajib.join(" atau ")}`,
      });
    }

    next();
  };
};

// cek modul aktif di skeolah user
export const requireModul = (kodeModul: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: belum login",
      });
    }

    if (!user.modulAktif.includes(kodeModul)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: modul "${kodeModul}" tidak aktif untuk sekolah ini`,
      });
    }

    next();
  };
};
