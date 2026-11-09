import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import { createSikapPerilakuSchema, updateSikapPerilakuSchema } from "../validations/sikapPerilaku.validation";

export const getSikapPerilaku = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);
    const userSekolahId = user?.sekolahId;
    const { jenis, kelasId, siswaId, search, tanggalMulai, tanggalSelesai } = req.query;

    const where: any = {
      dihapusPada: null,
    };

    if (!isSuper && userSekolahId) {
      where.sekolahId = userSekolahId;
    } else if (req.query.sekolahId && typeof req.query.sekolahId === "string") {
      where.sekolahId = req.query.sekolahId;
    }

    if (jenis && typeof jenis === "string") {
      where.jenis = jenis;
    }

    if (kelasId && typeof kelasId === "string") {
      where.kelasId = kelasId;
    }

    if (siswaId && typeof siswaId === "string") {
      where.siswaId = siswaId;
    }

    if (tanggalMulai || tanggalSelesai) {
      where.tanggal = {};
      if (tanggalMulai) where.tanggal.gte = new Date(tanggalMulai as string);
      if (tanggalSelesai) where.tanggal.lte = new Date(tanggalSelesai as string);
    }

    if (search && typeof search === "string") {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { catatan: { contains: search, mode: "insensitive" } },
        { kelas: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.sikapPerilaku.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
        kelasRel: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
          },
        },
      },
      orderBy: [{ tanggal: "desc" }, { dibuatPada: "desc" }],
    });

    return successResponse(res, "Data catatan sikap & perilaku berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getSikapPerilakuById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const item = await prisma.sikapPerilaku.findFirst({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
        kelasRel: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    return successResponse(res, "Detail sikap & perilaku berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createSikapPerilaku = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const validated = createSikapPerilakuSchema.parse(req.body);

    const created = await prisma.sikapPerilaku.create({
      data: {
        sekolahId: effectiveSekolahId,
        nama: validated.nama,
        kelas: validated.kelas || null,
        siswaId: validated.siswaId || null,
        kelasId: validated.kelasId || null,
        jenis: validated.jenis,
        catatan: validated.catatan,
        poin: validated.poin,
        tanggal: new Date(validated.tanggal),
        dibuatOleh: user?.userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
        kelasRel: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
          },
        },
      },
    });

    return successResponse(res, "Catatan sikap & perilaku berhasil ditambahkan", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSikapPerilaku = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.sikapPerilaku.findFirst({ where });
    if (!existing) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    const validated = updateSikapPerilakuSchema.parse(req.body);

    const updateData: any = {
      ...validated,
      diperbaruiOleh: user?.userId,
    };
    if (validated.tanggal) {
      updateData.tanggal = new Date(validated.tanggal);
    }

    const updated = await prisma.sikapPerilaku.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
        kelasRel: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
          },
        },
      },
    });

    return successResponse(res, "Catatan sikap & perilaku berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSikapPerilaku = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.sikapPerilaku.findFirst({ where });
    if (!existing) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    await prisma.sikapPerilaku.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: user?.userId,
      },
    });

    return successResponse(res, "Catatan sikap & perilaku berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
