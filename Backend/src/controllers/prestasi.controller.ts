import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import { createPrestasiSchema, updatePrestasiSchema } from "../validations/prestasi.validation";

export const getPrestasi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);
    const userSekolahId = user?.sekolahId;
    const { tingkat, tahun, bulan, search, siswaId } = req.query;

    const where: any = {
      dihapusPada: null,
    };

    if (!isSuper && userSekolahId) {
      where.sekolahId = userSekolahId;
    } else if (req.query.sekolahId && typeof req.query.sekolahId === "string") {
      where.sekolahId = req.query.sekolahId;
    }

    if (tingkat && typeof tingkat === "string") {
      where.tingkat = tingkat;
    }

    if (tahun) {
      where.tahun = Number(tahun);
    }

    if (bulan && typeof bulan === "string") {
      where.bulan = bulan;
    }

    if (siswaId && typeof siswaId === "string") {
      where.siswaId = siswaId;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { namaSiswa: { contains: search, mode: "insensitive" } },
        { namaLomba: { contains: search, mode: "insensitive" } },
        { penyelenggara: { contains: search, mode: "insensitive" } },
        { kelas: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.prestasi.findMany({
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
      orderBy: [{ tahun: "desc" }, { dibuatPada: "desc" }],
    });

    return successResponse(res, "Data prestasi berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getPrestasiById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = {
      id,
      dihapusPada: null,
    };

    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const item = await prisma.prestasi.findFirst({
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
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    return successResponse(res, "Detail prestasi berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createPrestasi = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const validated = createPrestasiSchema.parse(req.body);

    const created = await prisma.prestasi.create({
      data: {
        sekolahId: effectiveSekolahId,
        namaSiswa: validated.namaSiswa,
        kelas: validated.kelas || null,
        siswaId: validated.siswaId || null,
        kelasId: validated.kelasId || null,
        namaLomba: validated.namaLomba,
        tingkat: validated.tingkat,
        juara: validated.juara,
        bulan: validated.bulan || null,
        tahun: validated.tahun,
        penyelenggara: validated.penyelenggara,
        keterangan: validated.keterangan || null,
        sertifikatUrl: validated.sertifikatUrl || null,
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

    return successResponse(res, "Prestasi berhasil ditambahkan", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePrestasi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.prestasi.findFirst({ where });
    if (!existing) {
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    const validated = updatePrestasiSchema.parse(req.body);

    const updated = await prisma.prestasi.update({
      where: { id },
      data: {
        ...validated,
        diperbaruiOleh: user?.userId,
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

    return successResponse(res, "Prestasi berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deletePrestasi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.prestasi.findFirst({ where });
    if (!existing) {
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    await prisma.prestasi.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: user?.userId,
      },
    });

    return successResponse(res, "Prestasi berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
