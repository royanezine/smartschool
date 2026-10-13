import { NextFunction, Response } from "express";

import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { getKkmConfig, KKM_KEY } from "../utils/kkm";

const isIntInRange = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

export const getKkm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Akses ditolak", 403);

    const config = await getKkmConfig(sekolahId);
    return successResponse(res, "KKM berhasil diambil", config);
  } catch (error) {
    next(error);
  }
};

export const setKkm = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const sekolahId = req.user?.sekolahId;
    if (!userId || !sekolahId) throw new AppError("Akses ditolak", 403);

    const { kkmDefault, kkmPerMapel } = req.body ?? {};

    if (kkmDefault === undefined || kkmDefault === null)
      throw new AppError("kkmDefault wajib diisi", 400);
    if (!isIntInRange(kkmDefault, 0, 100))
      throw new AppError("kkmDefault harus bilangan bulat 0–100", 400);

    const perMapel: Record<string, number> = {};

    if (kkmPerMapel !== undefined && kkmPerMapel !== null) {
      if (typeof kkmPerMapel !== "object" || Array.isArray(kkmPerMapel))
        throw new AppError("kkmPerMapel harus berupa object JSON", 400);

      for (const [key, value] of Object.entries(kkmPerMapel)) {
        if (!isIntInRange(value, 0, 100))
          throw new AppError(
            `KKM mapel "${key}" harus bilangan bulat 0–100`,
            400,
          );
        perMapel[key.trim().toLowerCase()] = value as number;
      }

      const mapelSekolah = await prisma.mataPelajaran.findMany({
        where: { sekolahId, dihapusOleh: null },
        select: { nama: true },
      });
      const namaSet = new Set(
        mapelSekolah.map((m) => m.nama.trim().toLowerCase()),
      );
      const tidakAda = Object.keys(perMapel).filter((k) => !namaSet.has(k));

      if (tidakAda.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Ada mata pelajaran yang tidak terdaftar di sekolah",
          data: tidakAda,
        });
      }
    }

    const nilaiJson = JSON.stringify({ kkmDefault, kkmPerMapel: perMapel });

    const existing = await prisma.pengaturanSistem.findFirst({
      where: { sekolahId, kunci: KKM_KEY, dihapusOleh: null },
    });

    if (existing) {
      await prisma.pengaturanSistem.update({
        where: { id: existing.id },
        data: { nilai: nilaiJson, diperbaruiOleh: userId },
      });
    } else {
      await prisma.pengaturanSistem.create({
        data: {
          sekolahId,
          kunci: KKM_KEY,
          nilai: nilaiJson,
          tipeData: "json",
          kelompok: "akademik",
          keterangan: "KKM default dan per mata pelajaran",
          dibuatOleh: userId,
        },
      });
    }

    return successResponse(res, "KKM berhasil disimpan", {
      kkmDefault,
      kkmPerMapel: perMapel,
    });
  } catch (error) {
    next(error);
  }
};