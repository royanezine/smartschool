import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import {
  createShiftKerjaSchema,
  updateShiftKerjaSchema,
} from "../validations/shiftKerja.validation";
import { z } from "zod";

const MAX_LIMIT = 100;

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

const getRequestedSekolahId = (req: AuthRequest): string | undefined => {
  const fromQuery = typeof req.query?.sekolahId === "string" ? req.query.sekolahId : undefined;
  const fromBody =
    req.body && typeof req.body.sekolahId === "string" ? (req.body.sekolahId as string) : undefined;
  return fromQuery || fromBody;
};

export const createShiftKerja = async (req: AuthRequest, res: Response) => {
  const data = createShiftKerjaSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, data.sekolahId);
  const userId = req.user?.userId;

  const shift = await prisma.shiftKerja.create({
    data: {
      sekolahId,
      nama: data.nama,
      kode: data.kode || null,
      jamMasuk: data.jamMasuk,
      jamKeluar: data.jamKeluar,
      toleransiTerlambatMenit: data.toleransiTerlambatMenit,
      status: data.status,
      dibuatOleh: userId,
    },
  });

  return successResponse(res, "Master shift kerja berhasil dibuat", shift, 201);
};

export const getShiftKerja = async (req: AuthRequest, res: Response) => {
  const targetSekolahId = req.query.sekolahId as string | undefined;
  const sekolahId = getTenantSekolahId(req, targetSekolahId);

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || 20));
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
    prisma.shiftKerja.count({ where }),
    prisma.shiftKerja.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: { pengguna: true, absensi: true },
        },
      },
      orderBy: { jamMasuk: "asc" },
    }),
  ]);

  const formatted = data.map((item) => ({
    ...item,
    jumlahPegawai: item._count.pengguna,
    totalAbsensi: item._count.absensi,
  }));

  return paginatedResponse(res, "Data shift kerja berhasil diambil", formatted, page, limit, total);
};

export const getShiftKerjaById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req, getRequestedSekolahId(req));

  const item = await prisma.shiftKerja.findFirst({
    where: { id, sekolahId, dihapusPada: null },
    include: {
      _count: {
        select: { pengguna: true, absensi: true },
      },
    },
  });

  if (!item) {
    throw new AppError("Shift kerja tidak ditemukan", 404);
  }

  return successResponse(res, "Detail shift kerja berhasil diambil", {
    ...item,
    jumlahPegawai: item._count.pengguna,
    totalAbsensi: item._count.absensi,
  });
};

export const updateShiftKerja = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const data = updateShiftKerjaSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, getRequestedSekolahId(req));

  const existing = await prisma.shiftKerja.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });

  if (!existing) {
    throw new AppError("Shift kerja tidak ditemukan", 404);
  }

  const updated = await prisma.shiftKerja.update({
    where: { id },
    data: {
      nama: data.nama ?? existing.nama,
      kode: data.kode !== undefined ? data.kode : existing.kode,
      jamMasuk: data.jamMasuk ?? existing.jamMasuk,
      jamKeluar: data.jamKeluar ?? existing.jamKeluar,
      toleransiTerlambatMenit: data.toleransiTerlambatMenit ?? existing.toleransiTerlambatMenit,
      status: data.status ?? existing.status,
      diperbaruiOleh: req.user?.userId,
    },
  });

  return successResponse(res, "Shift kerja berhasil diperbarui", updated);
};

export const deleteShiftKerja = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req, getRequestedSekolahId(req));

  const existing = await prisma.shiftKerja.findFirst({
    where: { id, sekolahId, dihapusPada: null },
  });

  if (!existing) {
    throw new AppError("Shift kerja tidak ditemukan", 404);
  }

  const assignedUsersCount = await prisma.pengguna.count({
    where: { shiftKerjaId: id, dihapusPada: null },
  });

  if (assignedUsersCount > 0) {
    throw new AppError(
      `Tidak dapat menghapus shift kerja: Masih terdapat ${assignedUsersCount} pegawai yang terhubung ke shift ini.`,
      400,
    );
  }

  await prisma.shiftKerja.update({
    where: { id },
    data: {
      dihapusPada: new Date(),
      dihapusOleh: req.user?.userId,
      status: "nonaktif",
    },
  });

  return successResponse(res, "Shift kerja berhasil dinonaktifkan/dihapus");
};

const assignUserShiftSchema = z.object({
  penggunaId: z.string().uuid("ID Pengguna tidak valid"),
  shiftKerjaId: z.string().uuid("ID Shift Kerja tidak valid").nullable(),
  kategoriJabatanId: z.string().uuid("ID Kategori Jabatan tidak valid").optional().nullable(),
});

export const assignUserShiftAndJabatan = async (req: AuthRequest, res: Response) => {
  const data = assignUserShiftSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, getRequestedSekolahId(req));

  const targetUser = await prisma.pengguna.findFirst({
    where: { id: data.penggunaId, sekolahId, dihapusPada: null },
    include: { peran: true },
  });

  if (!targetUser) {
    throw new AppError("Pegawai tidak ditemukan di sekolah ini", 404);
  }

  if (targetUser.peran?.nama?.trim().toLowerCase() === "siswa") {
    throw new AppError("Penugasan shift kerja dan jabatan tidak berlaku untuk siswa", 400);
  }

  if (data.shiftKerjaId) {
    const shift = await prisma.shiftKerja.findFirst({
      where: { id: data.shiftKerjaId, sekolahId, dihapusPada: null },
    });
    if (!shift) {
      throw new AppError("Shift kerja tidak ditemukan di sekolah ini", 404);
    }
    if (shift.status !== "aktif") {
      throw new AppError(
        "Shift kerja tidak aktif dan tidak dapat ditugaskan. Aktifkan shift terlebih dahulu.",
        400,
      );
    }
  }

  if (data.kategoriJabatanId) {
    const jabatan = await prisma.kategoriJabatan.findFirst({
      where: { id: data.kategoriJabatanId, sekolahId, dihapusPada: null },
    });
    if (!jabatan) {
      throw new AppError("Kategori jabatan tidak ditemukan di sekolah ini", 404);
    }
  }

  const updateData: any = {
    shiftKerjaId: data.shiftKerjaId,
    diperbaruiOleh: req.user?.userId,
  };

  if (data.kategoriJabatanId !== undefined) {
    updateData.kategoriJabatanId = data.kategoriJabatanId;
  }

  const updatedUser = await prisma.pengguna.update({
    where: { id: data.penggunaId },
    data: updateData,
    select: {
      id: true,
      namaLengkap: true,
      email: true,
      shiftKerjaId: true,
      kategoriJabatanId: true,
      shiftKerjaMaster: true,
      kategoriJabatan: true,
    },
  });

  return successResponse(res, "Shift kerja dan jabatan pegawai berhasil diperbarui", updatedUser);
};