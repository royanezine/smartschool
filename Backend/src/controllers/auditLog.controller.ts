import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { paginatedResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import { normalizeRole } from "../utils/rbac";
import { AppError } from "../utils/appError";

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorRole = normalizeRole(req.user?.role);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (actorRole === "super_admin") {
      if (req.query.sekolahId) {
        where.sekolahId = req.query.sekolahId as string;
      }
    } else {
      if (!req.user?.sekolahId) {
        throw new AppError("Akses ditolak: sekolah tidak valid", 403);
      }
      where.sekolahId = req.user.sekolahId;
    }

    if (search) {
      where.OR = [
        { aksi: { contains: search, mode: "insensitive" } },
        { modul: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalData] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          pengguna: {
            select: {
              namaLengkap: true,
              peran: { select: { nama: true } },
            },
          },
        },
        orderBy: { waktu: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return paginatedResponse(
      res,
      "Audit log berhasil diambil",
      data,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};
