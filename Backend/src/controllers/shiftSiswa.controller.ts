import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  kodeShiftSiswaSchema,
  updateShiftSiswaSchema,
} from "../validations/shiftSiswa.validation";
import { formatShiftSiswa, pastikanShiftSiswa } from "../utils/shiftSiswa";

const getTenantSekolahId = (req: AuthRequest): string => {
  const actorRole = req.user?.role?.toLowerCase();
  const fromQuery =
    typeof req.query?.sekolahId === "string" ? req.query.sekolahId : undefined;

  if (actorRole === "super_admin" || actorRole === "superadmin") {
    const sekolahId = fromQuery || req.user?.sekolahId;
    if (!sekolahId) {
      throw new AppError("Superadmin wajib menyertakan sekolahId", 400);
    }
    return sekolahId;
  }

  if (!req.user?.sekolahId) {
    throw new AppError(
      "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
      403,
    );
  }
  return req.user.sekolahId;
};

export const getShiftSiswa = async (req: AuthRequest, res: Response) => {
  const sekolahId = getTenantSekolahId(req);
  const daftar = await pastikanShiftSiswa(sekolahId);

  return successResponse(
    res,
    "Data shift siswa berhasil diambil",
    daftar.map(formatShiftSiswa),
  );
};

export const updateShiftSiswa = async (req: AuthRequest, res: Response) => {
  const sekolahId = getTenantSekolahId(req);
  const kode = kodeShiftSiswaSchema.parse(req.params.kode);
  const data = updateShiftSiswaSchema.parse(req.body);

  await pastikanShiftSiswa(sekolahId);

  const existing = await prisma.shiftSiswa.findFirst({
    where: { sekolahId, kode },
  });
  if (!existing) throw new AppError("Shift siswa tidak ditemukan", 404);

  const jamMasuk = data.jamMasuk ?? existing.jamMasuk;
  const jamKeluar = data.jamKeluar ?? existing.jamKeluar;

  if (jamKeluar <= jamMasuk) {
    throw new AppError("Jam keluar harus lebih besar dari jam masuk", 400);
  }

  const updated = await prisma.shiftSiswa.update({
    where: { id: existing.id },
    data: {
      jamMasuk,
      jamKeluar,
      toleransiTerlambatMenit:
        data.toleransiTerlambatMenit ?? existing.toleransiTerlambatMenit,
      diperbaruiOleh: req.user?.userId,
    },
  });

  return successResponse(
    res,
    "Shift siswa berhasil diperbarui",
    formatShiftSiswa(updated),
  );
};