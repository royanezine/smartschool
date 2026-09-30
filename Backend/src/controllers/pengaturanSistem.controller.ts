import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getPengaturanSekolah = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Akses ditolak", 403);

    const pengaturan = await prisma.pengaturanSistem.findMany({
      where: { sekolahId, dihapusPada: null },
      select: {
        id: true,
        kunci: true,
        nilai: true,
        kelompok: true,
        keterangan: true,
      },
    });

    return successResponse(res, "Berhasil mengambil pengaturan", pengaturan);
  } catch (error) {
    next(error);
  }
};

export const upsertPengaturanSekolah = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const { kunci, nilai, tipeData, kelompok, keterangan } = req.body;

    if (!sekolahId) throw new AppError("Akses ditolak", 403);

    const existing = await prisma.pengaturanSistem.findFirst({
      where: { sekolahId, kunci },
    });

    let pengaturan;
    if (existing) {
      pengaturan = await prisma.pengaturanSistem.update({
        where: { id: existing.id },
        data: { nilai: String(nilai), diperbaruiOleh: userId },
      });
    } else {
      pengaturan = await prisma.pengaturanSistem.create({
        data: {
          sekolahId,
          kunci,
          nilai: String(nilai),
          tipeData: tipeData || "string",
          kelompok: kelompok || "general",
          keterangan,
          dibuatOleh: userId,
        },
      });
    }

    return successResponse(res, "Pengaturan berhasil disimpan", pengaturan);
  } catch (error) {
    next(error);
  }
};
