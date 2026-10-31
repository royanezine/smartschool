import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";
import { isSuperAdmin } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";
import { availableSchoolWhere } from "../utils/schoolAvailability";

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
        errorCode: "UNAUTHORIZED",
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
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: {
        id: sekolahId,
      },
      select: {
        id: true,
        status: true,
        dihapusPada: true,
      },
    });

    if (!sekolah || sekolah.dihapusPada !== null) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
        errorCode: "TENANT_NOT_FOUND",
      });
    }

    if (sekolah.status !== "aktif" && !await prisma.sekolah.findFirst({
      where: { id: sekolahId, ...availableSchoolWhere() }, select: { id: true },
    })) {
      return res.status(403).json({
        success: false,
        message: "Akses Ditolak: Sekolah tidak aktif",
        errorCode: "TENANT_INACTIVE",
      });
    }

    next();
  } catch (error) {
    next(error);
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
        errorCode: "UNAUTHORIZED",
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
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: {
        id: sekolahId,
      },
      select: {
        id: true,
        status: true,
        dihapusPada: true,
        yayasanId: true,
      },
    });

    if (!sekolah || sekolah.dihapusPada !== null) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
        errorCode: "TENANT_NOT_FOUND",
      });
    }

    // Jika sekolah berada di bawah naungan yayasan, cek langganan yayasan terlebih dahulu
    if (sekolah.yayasanId) {
      const { aktif } = await cekLanggananYayasan(sekolah.yayasanId);
      if (aktif) {
        return next();
      }
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
        errorCode: "SUBSCRIPTION_REQUIRED",
      });
    }

    const statusAktif =
      langganan.statusLangganan === "active" ||
      langganan.statusLangganan === "trialing";

    if (!statusAktif) {
      return res.status(403).json({
        success: false,
        message: "Langganan sekolah tidak aktif",
        errorCode: "SUBSCRIPTION_INACTIVE",
      });
    }

    if (langganan.tanggalMulai && langganan.tanggalMulai > new Date()) {
      return res.status(403).json({ success: false, message: "Langganan belum dimulai", errorCode: "SUBSCRIPTION_NOT_STARTED" });
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
        errorCode: "SUBSCRIPTION_EXPIRED",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
