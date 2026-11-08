import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import { createFasilitasSchema, updateFasilitasSchema } from "../validations/fasilitas.validation";

export const getFasilitas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);
    const userSekolahId = user?.sekolahId;
    const { kategori, kondisi, search } = req.query;

    const where: any = {
      dihapusPada: null,
    };

    if (!isSuper && userSekolahId) {
      where.sekolahId = userSekolahId;
    } else if (req.query.sekolahId && typeof req.query.sekolahId === "string") {
      where.sekolahId = req.query.sekolahId;
    }

    if (kategori && typeof kategori === "string" && kategori !== "Semua") {
      where.kategori = kategori;
    }

    if (kondisi && typeof kondisi === "string" && kondisi !== "Semua") {
      where.kondisi = kondisi;
    }

    if (search && typeof search === "string") {
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

export const getFasilitasById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const item = await prisma.fasilitas.findFirst({ where });
    if (!item) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    return successResponse(res, "Detail fasilitas berhasil diambil", item);
  } catch (error) {
    next(error);
  }
};

export const createFasilitas = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const validated = createFasilitasSchema.parse(req.body);

    const created = await prisma.fasilitas.create({
      data: {
        sekolahId: effectiveSekolahId,
        nama: validated.nama,
        lokasi: validated.lokasi,
        kategori: validated.kategori,
        kondisi: validated.kondisi || "Baik",
        kapasitas: validated.kapasitas || null,
        deskripsi: validated.deskripsi || null,
        foto: validated.foto || null,
        dibuatOleh: user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil ditambahkan", created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFasilitas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.fasilitas.findFirst({ where });
    if (!existing) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    const validated = updateFasilitasSchema.parse(req.body);

    const updated = await prisma.fasilitas.update({
      where: { id },
      data: {
        ...validated,
        diperbaruiOleh: user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteFasilitas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);

    const where: any = { id, dihapusPada: null };
    if (!isSuper && user?.sekolahId) {
      where.sekolahId = user.sekolahId;
    }

    const existing = await prisma.fasilitas.findFirst({ where });
    if (!existing) {
      throw new AppError("Data fasilitas tidak ditemukan", 404);
    }

    await prisma.fasilitas.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: user?.userId,
      },
    });

    return successResponse(res, "Fasilitas berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
