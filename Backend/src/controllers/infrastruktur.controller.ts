import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  createGedungSchema,
  updateGedungSchema,
  createLantaiSchema,
  updateLantaiSchema,
} from "../validations/infrastruktur.validation";

// === GEDUNG ===
export const getGedung = async (req: AuthRequest, res: Response) => {
  const sekolahId = req.user?.sekolahId;
  if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

  const gedung = await prisma.gedung.findMany({
    where: { sekolahId },
    include: {
      lantai: {
        include: {
          _count: { select: { kelas: true } },
        },
      },
    },
    orderBy: { nama: "asc" },
  });

  return successResponse(res, "Berhasil mengambil data gedung", gedung);
};

export const createGedung = async (req: AuthRequest, res: Response) => {
  const sekolahId = req.user?.sekolahId;
  if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

  const data = createGedungSchema.parse(req.body);

  const gedung = await prisma.gedung.create({
    data: {
      ...data,
      sekolahId,
    },
    include: { lantai: true },
  });

  return successResponse(res, "Gedung berhasil ditambahkan", gedung, 201);
};

export const updateGedung = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = req.user?.sekolahId;

  const existing = await prisma.gedung.findFirst({
    where: { id, sekolahId },
  });
  if (!existing) throw new AppError("Gedung tidak ditemukan", 404);

  const data = updateGedungSchema.parse(req.body);

  const gedung = await prisma.gedung.update({
    where: { id },
    data,
  });

  return successResponse(res, "Gedung berhasil diperbarui", gedung);
};

export const deleteGedung = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = req.user?.sekolahId;

  const existing = await prisma.gedung.findFirst({
    where: { id, sekolahId },
    include: { lantai: true },
  });
  if (!existing) throw new AppError("Gedung tidak ditemukan", 404);

  if (existing.lantai.length > 0) {
    throw new AppError(
      "Tidak dapat menghapus gedung yang masih memiliki lantai aktif",
      400,
    );
  }

  await prisma.gedung.delete({ where: { id } });

  return successResponse(res, "Gedung berhasil dihapus");
};

// === LANTAI ===
export const getLantaiByGedung = async (req: AuthRequest, res: Response) => {
  const gedungId = req.params.gedungId as string;
  const sekolahId = req.user?.sekolahId;

  const gedung = await prisma.gedung.findFirst({
    where: { id: gedungId, sekolahId },
  });
  if (!gedung) throw new AppError("Gedung tidak ditemukan", 404);

  const lantai = await prisma.lantai.findMany({
    where: { gedungId },
    include: {
      kelas: {
        select: { id: true, nama: true, tingkat: true },
      },
    },
    orderBy: { nama: "asc" },
  });

  return successResponse(res, "Berhasil mengambil data lantai", lantai);
};

export const createLantai = async (req: AuthRequest, res: Response) => {
  const sekolahId = req.user?.sekolahId;
  const data = createLantaiSchema.parse(req.body);

  const gedung = await prisma.gedung.findFirst({
    where: { id: data.gedungId, sekolahId },
  });
  if (!gedung)
    throw new AppError("Gedung tidak ditemukan di sekolah Anda", 404);

  const lantai = await prisma.lantai.create({
    data,
  });

  return successResponse(res, "Lantai berhasil ditambahkan", lantai, 201);
};

export const updateLantai = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const data = updateLantaiSchema.parse(req.body);

  const existing = await prisma.lantai.findUnique({
    where: { id },
    include: { gedung: true },
  });
  if (!existing || existing.gedung.sekolahId !== req.user?.sekolahId) {
    throw new AppError("Lantai tidak ditemukan", 404);
  }

  const lantai = await prisma.lantai.update({
    where: { id },
    data,
  });

  return successResponse(res, "Lantai berhasil diperbarui", lantai);
};

export const deleteLantai = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.lantai.findUnique({
    where: { id },
    include: { gedung: true, kelas: true },
  });
  if (!existing || existing.gedung.sekolahId !== req.user?.sekolahId) {
    throw new AppError("Lantai tidak ditemukan", 404);
  }

  if (existing.kelas.length > 0) {
    throw new AppError(
      "Tidak dapat menghapus lantai yang masih digunakan oleh kelas",
      400,
    );
  }

  await prisma.lantai.delete({ where: { id } });

  return successResponse(res, "Lantai berhasil dihapus");
};
