import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";
import { isSuperAdmin } from "../utils/rbac";
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

export { requireSubscription } from "./langganan.middleware";
