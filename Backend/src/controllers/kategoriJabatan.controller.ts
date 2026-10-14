import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import {
  createKategoriJabatanSchema,
  updateKategoriJabatanSchema,
  setTarifJabatanSchema,
} from "../validations/kategoriJabatan.validation";

const getTenantSekolahId = (req: AuthRequest, targetSekolahId?: string): string => {
  const actorRole = req.user?.role?.toLowerCase();
  if (actorRole === "super_admin" || actorRole === "superadmin") {
    const sId = targetSekolahId || req.user?.sekolahId;
    if (!sId) {
      throw new AppError("Superadmin wajib menyertakan sekolahId", 400);
    }
    return sId;
  }
  if (!req.user?.sekolahId) {
    throw new AppError("Akses ditolak: Anda tidak terhubung dengan sekolah manapun", 403);
  }
  return req.user.sekolahId;
};

export const createKategoriJabatan = async (req: AuthRequest, res: Response) => {
  const data = createKategoriJabatanSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, data.sekolahId);
  const userId = req.user?.userId;

  const result = await prisma.$transaction(async (tx) => {
    const jabatan = await tx.kategoriJabatan.create({
      data: {
        sekolahId,
        nama: data.nama,
        kode: data.kode || null,
        keterangan: data.keterangan || null,
        status: data.status,
        dibuatOleh: userId,
      },
    });

    const berlakuMulai = data.berlakuMulai ? new Date(data.berlakuMulai) : new Date();

    const tarif = await tx.tarifJabatan.create({
      data: {
        sekolahId,
        kategoriJabatanId: jabatan.id,
        tarifPerJam: data.tarifPerJam,
        berlakuMulai,
        berakhirPada: null,
        catatan: data.catatanTarif || "Tarif awal",
        dibuatOleh: userId,
      },
    });

    return {
      ...jabatan,
      tarifAktif: tarif,
    };
  });

  return successResponse(res, "Kategori jabatan dan tarif awal berhasil dibuat", result, 201);
};

export const getKategoriJabatan = async (req: AuthRequest, res: Response) => {
  const targetSekolahId = req.query.sekolahId as string | undefined;
  const sekolahId = getTenantSekolahId(req, targetSekolahId);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const skip = (page - 1) * limit;

  const where: any = {
    sekolahId,
    dihapusPada: null,
  };

  if (search) {
    where.OR = [
      { nama: { contains: search, mode: "insensitive" } },
      { kode: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [total, data] = await Promise.all([
    prisma.kategoriJabatan.count({ where }),
    prisma.kategoriJabatan.findMany({
      where,
      skip,
      take: limit,
      include: {
        tarifRiwayat: {
          orderBy: { berlakuMulai: "desc" },
        },
        _count: {
          select: { pengguna: true },
        },
      },
      orderBy: { dibuatPada: "desc" },
    }),
  ]);

  const formatted = data.map((item) => {
    const tarifAktif = item.tarifRiwayat.find((t) => t.berakhirPada === null) || item.tarifRiwayat[0] || null;
    return {
      ...item,
      tarifAktif,
      jumlahPengguna: item._count.pengguna,
    };
  });

  return paginatedResponse(res, "Data kategori jabatan berhasil diambil", formatted, page, limit, total);
};

export const getKategoriJabatanById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);

  const item = await prisma.kategoriJabatan.findFirst({
    where: {
      id,
      sekolahId,
      dihapusPada: null,
    },
    include: {
      tarifRiwayat: {
        orderBy: { berlakuMulai: "desc" },
      },
      _count: {
        select: { pengguna: true },
      },
    },
  });

  if (!item) {
    throw new AppError("Kategori jabatan tidak ditemukan", 404);
  }

  const tarifAktif = item.tarifRiwayat.find((t) => t.berakhirPada === null) || item.tarifRiwayat[0] || null;

  return successResponse(res, "Detail kategori jabatan berhasil diambil", {
    ...item,
    tarifAktif,
    jumlahPengguna: item._count.pengguna,
  });
};

export const updateKategoriJabatan = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);
  const data = updateKategoriJabatanSchema.parse(req.body);

  const existing = await prisma.kategoriJabatan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });

  if (!existing) {
    throw new AppError("Kategori jabatan tidak ditemukan", 404);
  }

  const updated = await prisma.kategoriJabatan.update({
    where: { id },
    data: {
      nama: data.nama ?? existing.nama,
      kode: data.kode !== undefined ? data.kode : existing.kode,
      keterangan: data.keterangan !== undefined ? data.keterangan : existing.keterangan,
      status: data.status ?? existing.status,
      diperbaruiOleh: req.user?.userId,
    },
  });

  return successResponse(res, "Kategori jabatan berhasil diperbarui", updated);
};

export const setTarifJabatan = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);
  const data = setTarifJabatanSchema.parse(req.body);
  const userId = req.user?.userId;

  const existing = await prisma.kategoriJabatan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });

  if (!existing) {
    throw new AppError("Kategori jabatan tidak ditemukan", 404);
  }

  const berlakuMulai = data.berlakuMulai ? new Date(data.berlakuMulai) : new Date();

  const newTarif = await prisma.$transaction(async (tx) => {
    // 1. Tutup tarif lama yang masih aktif (berakhirPada = null)
    await tx.tarifJabatan.updateMany({
      where: {
        kategoriJabatanId: id,
        sekolahId,
        berakhirPada: null,
      },
      data: {
        berakhirPada: berlakuMulai,
        diperbaruiOleh: userId,
      },
    });

    // 2. Buat tarif baru yang aktif
    return await tx.tarifJabatan.create({
      data: {
        sekolahId,
        kategoriJabatanId: id,
        tarifPerJam: data.tarifPerJam,
        berlakuMulai,
        berakhirPada: null,
        catatan: data.catatan || "Penyesuaian tarif per jam",
        dibuatOleh: userId,
      },
    });
  });

  return successResponse(res, "Tarif per jam baru berhasil ditetapkan", newTarif, 201);
};

export const deleteKategoriJabatan = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);

  const existing = await prisma.kategoriJabatan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });

  if (!existing) {
    throw new AppError("Kategori jabatan tidak ditemukan", 404);
  }

  const assignedUsersCount = await prisma.pengguna.count({
    where: { kategoriJabatanId: id, dihapusPada: null },
  });

  if (assignedUsersCount > 0) {
    throw new AppError(
      `Tidak dapat menghapus jabatan: Masih terdapat ${assignedUsersCount} pegawai yang terhubung ke jabatan ini.`,
      400,
    );
  }

  await prisma.kategoriJabatan.update({
    where: { id },
    data: {
      dihapusPada: new Date(),
      dihapusOleh: req.user?.userId,
      status: "nonaktif",
    },
  });

  return successResponse(res, "Kategori jabatan berhasil dinonaktifkan/dihapus");
};
