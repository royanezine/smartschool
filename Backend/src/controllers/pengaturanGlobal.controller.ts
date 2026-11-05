import { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  KelompokGlobal,
  SKEMA_PARSIAL,
  adalahKelompokGlobal,
  bacaGlobal,
  perbaruiGlobal,
} from "../utils/pengaturanGlobal";

const kelompokDariRequest = (req: AuthRequest): KelompokGlobal => {
  const nilai = String(req.params.kelompok ?? "identitas");
  if (!adalahKelompokGlobal(nilai)) {
    throw new AppError("Kelompok pengaturan global tidak dikenal", 404);
  }
  return nilai;
};

export async function ambilSemuaPengaturanGlobal(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const [identitas, pendaftaran, pemeliharaan] = await Promise.all([
      bacaGlobal(prisma, "identitas"),
      bacaGlobal(prisma, "pendaftaran"),
      bacaGlobal(prisma, "pemeliharaan"),
    ]);
    return successResponse(res, "Pengaturan global", {
      identitas,
      pendaftaran,
      pemeliharaan,
    });
  } catch (error) {
    next(error);
  }
}

export async function ambilPengaturanGlobal(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const kelompok = kelompokDariRequest(req);
    return successResponse(res, "Pengaturan global", await bacaGlobal(prisma, kelompok));
  } catch (error) {
    next(error);
  }
}

export async function simpanPengaturanGlobal(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const kelompok = kelompokDariRequest(req);
    const masukan = SKEMA_PARSIAL[kelompok].parse(req.body) as Record<string, unknown>;

    if (Object.keys(masukan).length === 0) {
      throw new AppError("Tidak ada data yang diperbarui", 400);
    }

    const userId = req.user.userId;
    const ipAddress = req.ip ? req.ip.slice(0, 45) : null;
    const userAgent = req.headers["user-agent"]
      ? req.headers["user-agent"].slice(0, 255)
      : null;

    const baru = await prisma.$transaction(async (tx) => {
      const hasil = await perbaruiGlobal(tx, kelompok, masukan, userId);

      await tx.auditLog.create({
        data: {
          penggunaId: userId,
          sekolahId: null,
          aksi: "update",
          modul: "pengaturan_global",
          entitasId: hasil.kunci,
          dataLama: hasil.lama as Prisma.InputJsonValue,
          dataBaru: hasil.baru as Prisma.InputJsonValue,
          ipAddress,
          userAgent,
        },
      });

      return hasil.baru;
    });

    return successResponse(res, "Pengaturan global disimpan", baru);
  } catch (error) {
    next(error);
  }
}

export async function ambilPengaturanGlobalPublik(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const [identitas, pemeliharaan] = await Promise.all([
      bacaGlobal(prisma, "identitas"),
      bacaGlobal(prisma, "pemeliharaan"),
    ]);
    return successResponse(res, "Pengaturan platform", { identitas, pemeliharaan });
  } catch (error) {
    next(error);
  }
}