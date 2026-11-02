import { Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { normalizeRole } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";

const presensiSchema = z
  .object({
    lintang: z.coerce.number().min(-90).max(90).optional(),
    bujur: z.coerce.number().min(-180).max(180).optional(),
    radiusAbsensi: z.coerce.number().int().min(1).max(100000).optional(),
    metodeAbsensiAktif: z
      .array(z.enum(["barcode", "lokasi", "face"]))
      .min(1)
      .transform((v) => Array.from(new Set(v)))
      .optional(),
  })
  .strict();

const tentukanSekolah = (req: AuthRequest) => {
  const role = normalizeRole(req.user?.role);
  const sekolahId =
    req.user?.sekolahId ||
    (role === "super_admin" && typeof req.query.sekolahId === "string"
      ? req.query.sekolahId
      : undefined);
  if (!sekolahId) throw new AppError("Akun tidak terhubung dengan sekolah", 403);
  return sekolahId;
};

const format = (s: {
  lintang: unknown;
  bujur: unknown;
  radiusAbsensi: number | null;
  metodeAbsensiAktif: string[];
}) => ({
  lintang: s.lintang === null ? null : Number(s.lintang),
  bujur: s.bujur === null ? null : Number(s.bujur),
  radiusAbsensi: s.radiusAbsensi,
  metodeAbsensiAktif: s.metodeAbsensiAktif,
});

export const getPengaturanPresensi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = tentukanSekolah(req);
    const sekolah = await prisma.sekolah.findFirst({
      where: { id: sekolahId, dihapusPada: null },
      select: {
        lintang: true,
        bujur: true,
        radiusAbsensi: true,
        metodeAbsensiAktif: true,
      },
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);
    return successResponse(res, "Berhasil mengambil pengaturan presensi", format(sekolah));
  } catch (error) {
    next(error);
  }
};

export const updatePengaturanPresensi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = tentukanSekolah(req);
    const data = presensiSchema.parse(req.body);
    if (Object.keys(data).length === 0) {
      throw new AppError("Tidak ada data yang diperbarui", 400);
    }
    const ada = await prisma.sekolah.findFirst({
      where: { id: sekolahId, dihapusPada: null },
      select: { id: true },
    });
    if (!ada) throw new AppError("Sekolah tidak ditemukan", 404);

    const sekolah = await prisma.sekolah.update({
      where: { id: sekolahId },
      data: { ...data, diperbaruiOleh: req.user!.userId },
      select: {
        lintang: true,
        bujur: true,
        radiusAbsensi: true,
        metodeAbsensiAktif: true,
      },
    });
    return successResponse(res, "Pengaturan presensi berhasil diperbarui", format(sekolah));
  } catch (error) {
    next(error);
  }
};