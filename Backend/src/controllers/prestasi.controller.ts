import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import {
  createPrestasiSchema,
  updatePrestasiSchema,
} from "../validations/prestasi.validation";

const relasi = {
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
} satisfies Prisma.PrestasiInclude;

const scopeWhere = (req: AuthRequest): Prisma.PrestasiWhereInput => {
  const user = req.user;
  const where: Prisma.PrestasiWhereInput = { dihapusPada: null };

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

const ambilSiswa = async (sekolahId: string, siswaId: string) => {
  const siswa = await prisma.pengguna.findFirst({
    where: { id: siswaId, sekolahId, dihapusPada: null },
    select: { id: true, namaLengkap: true },
  });

  if (!siswa) {
    throw new AppError("Siswa tidak ditemukan di sekolah ini", 404);
  }

  return siswa;
};

const ambilKelas = async (sekolahId: string, kelasId: string) => {
  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId, dihapusPada: null },
    select: { id: true, nama: true },
  });

  if (!kelas) {
    throw new AppError("Kelas tidak ditemukan di sekolah ini", 404);
  }

  return kelas;
};

export const getPrestasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const where = scopeWhere(req);
    const { tingkat, tahun, bulan, search, siswaId, kelasId } = req.query;

    if (typeof tingkat === "string" && tingkat) {
      where.tingkat = tingkat;
    }

    if (tahun !== undefined && tahun !== "") {
      const tahunAngka = Number(tahun);

      if (!Number.isInteger(tahunAngka)) {
        throw new AppError("Filter tahun tidak valid", 400);
      }

      where.tahun = tahunAngka;
    }

    if (typeof bulan === "string" && bulan) {
      where.bulan = bulan;
    }

    if (typeof siswaId === "string" && siswaId) {
      where.siswaId = siswaId;
    }

    if (typeof kelasId === "string" && kelasId) {
      where.kelasId = kelasId;
    }

    if (typeof search === "string" && search) {
      where.OR = [
        { namaSiswa: { contains: search, mode: "insensitive" } },
        { namaLomba: { contains: search, mode: "insensitive" } },
        { penyelenggara: { contains: search, mode: "insensitive" } },
        { kelas: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.prestasi.findMany({
      where,
      include: relasi,
      orderBy: [{ tahun: "desc" }, { dibuatPada: "desc" }],
    });

    return successResponse(res, "Data prestasi berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getPrestasiById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const item = await prisma.prestasi.findFirst({
      where: { ...scopeWhere(req), id },
      include: relasi,
    });

    if (!item) {
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    return successResponse(res, "Detail prestasi berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createPrestasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const sekolahId = tentukanSekolahId(req);
    const validated = createPrestasiSchema.parse(req.body);

    let namaSiswa = validated.namaSiswa;
    let namaKelas = validated.kelas ?? null;

    if (validated.siswaId) {
      const siswa = await ambilSiswa(sekolahId, validated.siswaId);
      namaSiswa = namaSiswa || siswa.namaLengkap;
    }

    if (validated.kelasId) {
      const kelas = await ambilKelas(sekolahId, validated.kelasId);
      namaKelas = namaKelas || kelas.nama;
    }

    if (!namaSiswa) {
      throw new AppError("Nama siswa wajib diisi", 400);
    }

    const created = await prisma.prestasi.create({
      data: {
        sekolahId,
        siswaId: validated.siswaId || null,
        kelasId: validated.kelasId || null,
        namaSiswa,
        kelas: namaKelas,
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
      include: relasi,
    });

    return successResponse(res, "Prestasi berhasil ditambahkan", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePrestasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    const existing = await prisma.prestasi.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    const validated = updatePrestasiSchema.parse(req.body);

    const data: Prisma.PrestasiUncheckedUpdateInput = {
      ...validated,
      diperbaruiOleh: user?.userId,
    };

    if (validated.siswaId) {
      const siswa = await ambilSiswa(existing.sekolahId, validated.siswaId);

      if (!validated.namaSiswa) {
        data.namaSiswa = siswa.namaLengkap;
      }
    }

    if (validated.kelasId) {
      const kelas = await ambilKelas(existing.sekolahId, validated.kelasId);

      if (validated.kelas === undefined) {
        data.kelas = kelas.nama;
      }
    }

    const updated = await prisma.prestasi.update({
      where: { id },
      data,
      include: relasi,
    });

    return successResponse(res, "Prestasi berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deletePrestasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.prestasi.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data prestasi tidak ditemukan", 404);
    }

    await prisma.prestasi.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Prestasi berhasil dihapus");
  } catch (error) {
    next(error);
  }
};