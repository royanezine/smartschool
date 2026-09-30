import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { paginatedResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAuditLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const where: any = { sekolahId };

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
            select: { namaLengkap: true, peran: { select: { nama: true } } },
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
