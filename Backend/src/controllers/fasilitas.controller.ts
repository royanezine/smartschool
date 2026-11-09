import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import {
  createFasilitasSchema,
  updateFasilitasSchema,
} from "../validations/fasilitas.validation";

const scopeWhere = (req: AuthRequest): Prisma.FasilitasWhereInput => {
  const user = req.user;
  const where: Prisma.FasilitasWhereInput = { dihapusPada: null };

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

export const getFasilitas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const where = scopeWhere(req);
    const { kategori, kondisi, search } = req.query;

    if (typeof kategori === "string" && kategori && kategori !== "Semua") {
      where.kategori = kategori;
    }

    if (typeof kondisi === "string" && kondisi && kondisi !== "Semua") {
      where.kondisi = kondisi;
    }

    if (typeof search === "string" && search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { lokasi: { contains: search, mode: "insensitive" } },
        { kategori: { contains: search, mode: "insensitive" } },
      ];
    }

    const data = await prisma.fasilitas.findMany({
      where,
      orderBy: { dibuatPada: "desc" },
    });

    return successResponse(res, "Data fasilitas berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getFasilitasById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const item = await prisma.fasilitas.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!item) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    return successResponse(res, "Detail fasilitas berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createFasilitas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = tentukanSekolahId(req);
    const validated = createFasilitasSchema.parse(req.body);

    const created = await prisma.fasilitas.create({
      data: {
        sekolahId,
        nama: validated.nama,
        lokasi: validated.lokasi,
        kategori: validated.kategori,
        kondisi: validated.kondisi,
        kapasitas: validated.kapasitas || null,
        deskripsi: validated.deskripsi || null,
        foto: validated.foto || null,
        dibuatOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil ditambahkan", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFasilitas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.fasilitas.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    const validated = updateFasilitasSchema.parse(req.body);

    const updated = await prisma.fasilitas.update({
      where: { id },
      data: {
        ...validated,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteFasilitas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.fasilitas.findFirst({
      where: { ...scopeWhere(req), id },
    });

    if (!existing) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    await prisma.fasilitas.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil dihapus");
  } catch (error) {
    next(error);
  }
};