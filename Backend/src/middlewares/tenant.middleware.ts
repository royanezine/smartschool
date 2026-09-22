import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";
import { isSuperAdmin } from "../utils/rbac";

export const requireTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (isSuperAdmin(req.user.role)) {
      return next();
    }

    const sekolahId = req.user.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Anda tidak terhubung dengan sekolah manapun",
      });
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: {
        id: sekolahId,
      },
    });

    if (!sekolah) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (sekolah.status !== "aktif") {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Sekolah tidak aktif",
      });
    }

    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const requireSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (isSuperAdmin(req.user.role)) {
      return next();
    }

    const sekolahId = req.user.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Pengguna tidak memiliki sekolah",
      });
    }

    const langganan = await prisma.langgananSekolah.findFirst({
      where: {
        sekolahId,
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    if (!langganan) {
      return res.status(403).json({
        success: false,
        message: "Sekolah belum memiliki langganan",
      });
    }

    const statusAktif =
      langganan.statusLangganan === "active" ||
      langganan.statusLangganan === "trialing";

    if (!statusAktif) {
      return res.status(403).json({
        success: false,
        message: "Langganan sekolah tidak aktif",
      });
    }

    if (
      langganan.tanggalBerakhir &&
      new Date() > new Date(langganan.tanggalBerakhir)
    ) {
      await prisma.langgananSekolah.update({
        where: {
          id: langganan.id,
        },
        data: {
          statusLangganan: "expired",
        },
      });

      return res.status(403).json({
        success: false,
        message: "Masa langganan telah kadaluarsa",
      });
    }

    next();
  } catch (error) {
    console.error("Subscription Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
