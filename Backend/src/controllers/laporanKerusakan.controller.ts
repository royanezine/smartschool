import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import {
  createLaporanKerusakanSchema,
  updateLaporanKerusakanSchema,
} from "../validations/laporanKerusakan.validation";

const scopeWhere = (req: AuthRequest): Prisma.LaporanKerusakanWhereInput => {
  const user = req.user;
  const where: Prisma.LaporanKerusakanWhereInput = { dihapusPada: null };

  if (isSuperAdmin(user?.role)) {
    if (typeof req.query.sekolahId === "string" && req.query.sekolahId) {
      where.sekolahId = req.query.sekolahId;
    }
    return where;
  }

  if (!user?.sekolahId) {
    throw new AppError("Anda tidak terhubung dengan sekolah", 403);
  }

  where.sekolahId = user.sekolahId;
  return where;
};

const tentukanSekolahId = (req: AuthRequest): string => {
  const user = req.user;

  if (isSuperAdmin(user?.role)) {
    const sekolahId =
      (typeof req.body?.sekolahId === "string" && req.body.sekolahId) ||
      user?.sekolahId;

    if (!sekolahId) {
      throw new AppError("ID Sekolah wajib disertakan", 400);
    }

    return sekolahId;
  }

  if (!user?.sekolahId) {
    throw new AppError("Sekolah tidak ditemukan", 400);
  }

  return user.sekolahId;
};

export const getLaporanKerusakan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const where = scopeWhere(req);
    const { status, asetId, search, tanggalMulai, tanggalSelesai } = req.query;

    if (typeof status === "string" && status && status !== "Semua") {
      where.status = status;
    }

    if (typeof asetId === "string" && asetId) {
      where.asetId = asetId;
    }

    if (tanggalMulai || tanggalSelesai) {
      const rentang: Prisma.DateTimeFilter = {};

      if (typeof tanggalMulai === "string" && tanggalMulai) {
        const mulai = new Date(tanggalMulai);

        if (Number.isNaN(mulai.getTime())) {
          throw new AppError("tanggalMulai tidak valid", 400);
        }

        rentang.gte = mulai;
      }

      if (typeof tanggalSelesai === "string" && tanggalSelesai) {
        const selesai = new Date(tanggalSelesai);

        if (Number.isNaN(selesai.getTime())) {
          throw new AppError("tanggalSelesai tidak valid", 400);
        }

        rentang.lte = selesai;
      }

      where.tanggalLaporan = rentang;
    }

    if (typeof search === "string" && search) {
      where.OR = [
        { deskripsi: { contains: search, mode: "insensitive" } },
        { catatanPerbaikan: { contains: search, mode: "insensitive" } },
        { aset: { nama: { contains: search, mode: "insensitive" } } },
      ];
    }

    const data = await prisma.laporanKerusakan.findMany({
      where,
      include: {
        aset: {
          select: {
            id: true,
            nama: true,
            kode: true,
            kondisi: true,
            lokasi: true,
            gudang: {
              select: {
                id: true,
                nama: true,
              },
            },
            kategoriAset: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      orderBy: { tanggalLaporan: "desc" },
    });

    return successResponse(res, "Data laporan kerusakan berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getLaporanKerusakanById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const item = await prisma.laporanKerusakan.findFirst({
      where: { ...scopeWhere(req), id },
      include: {
        aset: {
          include: {
            gudang: true,
            kategoriAset: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError("Data laporan kerusakan tidak ditemukan", 404);
    }

    return successResponse(res, "Detail laporan kerusakan berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createLaporanKerusakan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const sekolahId = tentukanSekolahId(req);
    const validated = createLaporanKerusakanSchema.parse(req.body);

    const aset = await prisma.aset.findFirst({
      where: {
        id: validated.asetId,
        sekolahId,
        dihapusPada: null,
      },
      select: { id: true },
    });

    if (!aset) {
      throw new AppError("Aset tidak ditemukan pada sekolah ini", 404);
    }

    const created = await prisma.laporanKerusakan.create({
      data: {
        sekolahId,
        asetId: validated.asetId,
        dilaporkanOleh: user?.email || user?.userId || "Petugas",
        tanggalLaporan: validated.tanggalLaporan ?? new Date(),
        deskripsi: validated.deskripsi,
        status: validated.status || "menunggu",
        catatanPerbaikan: validated.catatanPerbaikan || null,
        dibuatOleh: user?.userId,
      },
      include: {
        aset: true,
      },
    });

    return successResponse(res, "Laporan kerusakan berhasil dibuat", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateLaporanKerusakan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.laporanKerusakan.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data laporan kerusakan tidak ditemukan", 404);
    }

    const validated = updateLaporanKerusakanSchema.parse(req.body);

    const updated = await prisma.laporanKerusakan.update({
      where: { id },
      data: {
        ...validated,
        diperbaruiOleh: req.user?.userId,
      },
      include: {
        aset: true,
      },
    });

    return successResponse(res, "Laporan kerusakan berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteLaporanKerusakan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.laporanKerusakan.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data laporan kerusakan tidak ditemukan", 404);
    }

    await prisma.laporanKerusakan.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Laporan kerusakan berhasil dihapus");
  } catch (error) {
    next(error);
  }
};