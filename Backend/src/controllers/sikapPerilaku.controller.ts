import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import {
  createSikapPerilakuSchema,
  updateSikapPerilakuSchema,
} from "../validations/sikapPerilaku.validation";

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
} satisfies Prisma.SikapPerilakuInclude;

const scopeWhere = (req: AuthRequest): Prisma.SikapPerilakuWhereInput => {
  const user = req.user;
  const where: Prisma.SikapPerilakuWhereInput = { dihapusPada: null };

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

  if (normalizeRole(user.role) === "siswa") {
    where.siswaId = user.userId;
  }

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

export const getSikapPerilaku = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const where = scopeWhere(req);
    const { jenis, kelasId, siswaId, search, tanggalMulai, tanggalSelesai } =
      req.query;

    if (typeof jenis === "string" && jenis) {
      where.jenis = jenis;
    }

    if (typeof kelasId === "string" && kelasId) {
      where.kelasId = kelasId;
    }

    if (typeof siswaId === "string" && siswaId && !where.siswaId) {
      where.siswaId = siswaId;
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

      where.tanggal = rentang;
    }

    if (typeof search === "string" && search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { catatan: { contains: search, mode: "insensitive" } },
        { kelas: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.sikapPerilaku.findMany({
      where,
      include: relasi,
      orderBy: [{ tanggal: "desc" }, { dibuatPada: "desc" }],
    });

    return successResponse(
      res,
      "Data catatan sikap & perilaku berhasil diambil",
      data,
    );
  } catch (error) {
    next(error);
  }
};

export const getSikapPerilakuById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const item = await prisma.sikapPerilaku.findFirst({
      where: { ...scopeWhere(req), id },
      include: relasi,
    });

    if (!item) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    return successResponse(res, "Detail sikap & perilaku berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createSikapPerilaku = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const sekolahId = tentukanSekolahId(req);
    const validated = createSikapPerilakuSchema.parse(req.body);

    let nama = validated.nama;
    let namaKelas = validated.kelas ?? null;

    if (validated.siswaId) {
      const siswa = await ambilSiswa(sekolahId, validated.siswaId);
      nama = nama || siswa.namaLengkap;
    }

    if (validated.kelasId) {
      const kelas = await ambilKelas(sekolahId, validated.kelasId);
      namaKelas = namaKelas || kelas.nama;
    }

    if (!nama) {
      throw new AppError("Nama siswa wajib diisi", 400);
    }

    const created = await prisma.sikapPerilaku.create({
      data: {
        sekolahId,
        siswaId: validated.siswaId || null,
        kelasId: validated.kelasId || null,
        nama,
        kelas: namaKelas,
        jenis: validated.jenis,
        catatan: validated.catatan,
        poin: validated.poin,
        tanggal: validated.tanggal,
        dibuatOleh: user?.userId,
      },
      include: relasi,
    });

    return successResponse(
      res,
      "Catatan sikap & perilaku berhasil ditambahkan",
      created,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const updateSikapPerilaku = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    const existing = await prisma.sikapPerilaku.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    const validated = updateSikapPerilakuSchema.parse(req.body);

    const data: Prisma.SikapPerilakuUncheckedUpdateInput = {
      ...validated,
      diperbaruiOleh: user?.userId,
    };

    if (validated.siswaId) {
      const siswa = await ambilSiswa(existing.sekolahId, validated.siswaId);

      if (!validated.nama) {
        data.nama = siswa.namaLengkap;
      }
    }

    if (validated.kelasId) {
      const kelas = await ambilKelas(existing.sekolahId, validated.kelasId);

      if (validated.kelas === undefined) {
        data.kelas = kelas.nama;
      }
    }

    const updated = await prisma.sikapPerilaku.update({
      where: { id },
      data,
      include: relasi,
    });

    return successResponse(
      res,
      "Catatan sikap & perilaku berhasil diperbarui",
      updated,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteSikapPerilaku = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.sikapPerilaku.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data sikap & perilaku tidak ditemukan", 404);
    }

    await prisma.sikapPerilaku.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Catatan sikap & perilaku berhasil dihapus");
  } catch (error) {
    next(error);
  }
};