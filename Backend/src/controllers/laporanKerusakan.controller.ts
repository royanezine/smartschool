import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import {
  createLaporanKerusakanSchema,
  updateLaporanKerusakanSchema,
} from "../validations/laporanKerusakan.validation";

export const getLaporanKerusakan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);
    const userSekolahId = user?.sekolahId;
    const { status, asetId, search, tanggalMulai, tanggalSelesai } = req.query;

    const where: any = {
      dihapusPada: null,
    };

    if (!isSuper && userSekolahId) {
      where.sekolahId = userSekolahId;
    } else if (req.query.sekolahId && typeof req.query.sekolahId === "string") {
      where.sekolahId = req.query.sekolahId;
    }

    if (status && typeof status === "string" && status !== "Semua") {
      where.status = status;
    }

    if (asetId && typeof asetId === "string") {
      where.asetId = asetId;
    }

    if (tanggalMulai || tanggalSelesai) {
      where.tanggalLaporan = {};
      if (tanggalMulai) where.tanggalLaporan.gte = new Date(tanggalMulai as string);
      if (tanggalSelesai) where.tanggalLaporan.lte = new Date(tanggalSelesai as string);
    }

    if (search && typeof search === "string") {
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

export const getLaporanKerusakanById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const item = await prisma.laporanKerusakan.findFirst({
      where,
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

export const createLaporanKerusakan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const sekolahId = user?.sekolahId;
    if (!sekolahId && !isSuperAdmin(user?.role)) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    const effectiveSekolahId = sekolahId || req.body.sekolahId;
    if (!effectiveSekolahId) {
      throw new AppError("ID Sekolah wajib disertakan", 400);
    }

    const validated = createLaporanKerusakanSchema.parse(req.body);

    // Pastikan aset ada dan sesuai sekolah
    const aset = await prisma.aset.findFirst({
      where: {
        id: validated.asetId,
        sekolahId: effectiveSekolahId,
        dihapusPada: null,
      },
    });

    if (!aset) {
      throw new AppError("Aset tidak ditemukan pada sekolah ini", 404);
    }

    const created = await prisma.laporanKerusakan.create({
      data: {
        sekolahId: effectiveSekolahId,
        asetId: validated.asetId,
        dilaporkanOleh: user?.email || user?.userId || "Petugas",
        tanggalLaporan: validated.tanggalLaporan ? new Date(validated.tanggalLaporan) : new Date(),
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

export const updateLaporanKerusakan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.laporanKerusakan.findFirst({ where });
    if (!existing) {
      throw new AppError("Data laporan kerusakan tidak ditemukan", 404);
    }

    const validated = updateLaporanKerusakanSchema.parse(req.body);

    const updated = await prisma.laporanKerusakan.update({
      where: { id },
      data: {
        ...validated,
        diperbaruiOleh: user?.userId,
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

export const deleteLaporanKerusakan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.laporanKerusakan.findFirst({ where });
    if (!existing) {
      throw new AppError("Data laporan kerusakan tidak ditemukan", 404);
    }

    await prisma.laporanKerusakan.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: user?.userId,
      },
    });

    return successResponse(res, "Laporan kerusakan berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
