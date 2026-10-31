import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import { normalizeRole } from "../utils/rbac";
import { z } from "zod";

export const getPengaturanSekolah = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorRole = normalizeRole(req.user?.role);
    let sekolahId = req.user?.sekolahId;
    if (actorRole === "super_admin" && req.query.sekolahId) {
      sekolahId = req.query.sekolahId as string;
    }
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
    const actorRole = normalizeRole(req.user?.role);
    let sekolahId = req.user?.sekolahId;
    if (actorRole === "super_admin" && (req.body.sekolahId || req.query.sekolahId)) {
      sekolahId = (req.body.sekolahId || req.query.sekolahId) as string;
    }
    const userId = req.user?.userId;
    const { kunci, nilai, tipeData, kelompok, keterangan } = z.object({
      kunci: z.string().trim().min(1).max(100), nilai: z.union([z.string().max(100000), z.number().finite(), z.boolean(), z.record(z.string(), z.unknown()), z.array(z.unknown())]),
      tipeData: z.enum(["string", "number", "boolean", "json"]).default("string"),
      kelompok: z.string().max(20).default("general"), keterangan: z.string().max(10000).optional(), sekolahId: z.string().uuid().optional(),
    }).strict().parse(req.body);
    if (kunci === "hari_aktif_presensi" || kunci === "kkm_mapel" || kunci.startsWith("agregat_rapor:")) throw new AppError("Gunakan endpoint pengaturan khusus agar validasi dan scope tetap konsisten", 400);
    if (typeof nilai === "object" && tipeData !== "json") throw new AppError("Nilai object/array harus memakai tipeData json", 400);
    if (tipeData === "number" && (typeof nilai !== "number" || !Number.isFinite(nilai))) throw new AppError("Nilai harus berupa angka", 400);
    if (tipeData === "boolean" && typeof nilai !== "boolean") throw new AppError("Nilai harus berupa boolean", 400);
    let storedValue: string;
    try { storedValue = tipeData === "json" ? JSON.stringify(typeof nilai === "string" ? JSON.parse(nilai) : nilai) : String(nilai); }
    catch { throw new AppError("Nilai JSON tidak valid", 400); }

    if (!sekolahId) throw new AppError("Akses ditolak", 403);

    const existing = await prisma.pengaturanSistem.findFirst({
      where: { sekolahId, kunci },
    });

    let pengaturan;
    if (existing) {
      pengaturan = await prisma.pengaturanSistem.update({
        where: { id: existing.id },
        data: { nilai: storedValue, tipeData, kelompok, keterangan, diperbaruiOleh: userId },
      });
    } else {
      pengaturan = await prisma.pengaturanSistem.create({
        data: {
          sekolahId,
          kunci,
          nilai: storedValue,
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
