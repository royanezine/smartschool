// src/controllers/audit.controller.ts
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
    const skip = (page - 1) * limit;

    const [data, totalData] = await Promise.all([
      prisma.auditLog.findMany({
        where: { sekolahId },
        skip,
        take: limit,
        orderBy: { waktu: "desc" },
      }),
      prisma.auditLog.count({ where: { sekolahId } }),
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
