import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { resolveRoomLocation } from "../services/ruanganLocation.service";
import {
  gudangSchema,
  kategoriAsetSchema,
  asetSchema,
  ruanganSchema,
} from "../validations/sarpras.validation";

export const createGudang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = gudangSchema.parse(req.body);
    const gudang = await prisma.gudang.create({
      data: { ...validatedData, sekolahId },
    });
    return successResponse(res, "Gudang berhasil dibuat", gudang, 201);
  } catch (error) {
    next(error);
  }
};

export const getGudang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const gudang = await prisma.gudang.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    return successResponse(res, "Berhasil mengambil data gudang", gudang, 200);
  } catch (error) {
    next(error);
  }
};

export const getDetailGudang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const gudang = await prisma.gudang.findFirst({
      where: { id, sekolahId, dihapusPada: null },
      include: {
        aset: {
          where: { dihapusPada: null },
          include: {
            kategoriAset: true,
          },
        },
      },
    });

    if (!gudang) throw new AppError("Gudang tidak ditemukan", 404);

    return successResponse(res, "Berhasil mengambil detail gudang", gudang, 200);
  } catch (error) {
    next(error);
  }
};

export const updateGudang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = gudangSchema.parse(req.body);

    const gudang = await prisma.gudang.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!gudang) throw new AppError("Gudang tidak ditemukan", 404);

    const updated = await prisma.gudang.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(res, "Gudang berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteGudang = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const gudang = await prisma.gudang.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!gudang) throw new AppError("Gudang tidak ditemukan", 404);

    await prisma.gudang.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Gudang berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

export const createKategoriAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = kategoriAsetSchema.parse(req.body);
    const kategori = await prisma.kategoriAset.create({
      data: { ...validatedData, sekolahId },
    });
    return successResponse(res, "Kategori aset berhasil dibuat", kategori, 201);
  } catch (error) {
    next(error);
  }
};

export const getKategoriAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const kategori = await prisma.kategoriAset.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    return successResponse(
      res,
      "Berhasil mengambil kategori aset",
      kategori,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const updateKategoriAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = kategoriAsetSchema.parse(req.body);

    const kategori = await prisma.kategoriAset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!kategori) throw new AppError("Kategori aset tidak ditemukan", 404);

    const updated = await prisma.kategoriAset.update({
      where: { id },
      data: validatedData,
    });

    return successResponse(
      res,
      "Kategori aset berhasil diperbarui",
      updated,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteKategoriAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const kategori = await prisma.kategoriAset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!kategori) throw new AppError("Kategori aset tidak ditemukan", 404);

    await prisma.kategoriAset.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Kategori aset berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

export const createRuangan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = ruanganSchema.parse(req.body);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    const location = await resolveRoomLocation(sekolahId, validatedData);
    const ruangan = await prisma.ruangan.create({
      data: { ...validatedData, ...location, sekolahId },
      include: { gedung: true, lantai: true },
    });
    return successResponse(res, "Ruangan berhasil dibuat", ruangan, 201);
  } catch (error) {
    next(error);
  }
};

export const getRuangan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    const ruangan = await prisma.ruangan.findMany({
      where: { sekolahId, dihapusPada: null },
      include: { gedung: true, lantai: true, _count: { select: { kelas: true } } },
    });
    return successResponse(
      res,
      "Berhasil mengambil data ruangan",
      ruangan,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const updateRuangan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    const validatedData = ruanganSchema.partial().parse(req.body);

    const ruangan = await prisma.ruangan.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!ruangan) throw new AppError("Ruangan tidak ditemukan", 404);

    const location = await resolveRoomLocation(sekolahId, validatedData, ruangan);
    const updated = await prisma.ruangan.update({
      where: { id },
      data: { ...validatedData, ...location },
      include: { gedung: true, lantai: true },
    });

    return successResponse(res, "Ruangan berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteRuangan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const ruangan = await prisma.ruangan.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!ruangan) throw new AppError("Ruangan tidak ditemukan", 404);

    if (await prisma.kelas.count({where: {ruanganId: id, dihapusPada: null}})) {
      throw new AppError("Ruangan masih digunakan oleh kelas. Pindahkan kelas terlebih dahulu.", 409);
    }
    await prisma.ruangan.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Ruangan berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

export const createAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = asetSchema.parse(req.body);

    const existingAset = await prisma.aset.findFirst({
      where: { kode: validatedData.kode, sekolahId, dihapusPada: null },
    });
    if (existingAset) throw new AppError("Kode aset sudah digunakan", 400);

    const aset = await prisma.aset.create({
      data: {
        ...validatedData,
        sekolahId,
      } as any,
    });
    return successResponse(res, "Aset berhasil dibuat", aset, 201);
  } catch (error) {
    next(error);
  }
};

export const getAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const asets = await prisma.aset.findMany({
      where: { sekolahId, dihapusPada: null },
    });

    const gudangs = await prisma.gudang.findMany({ where: { sekolahId } });
    const kategoris = await prisma.kategoriAset.findMany({
      where: { sekolahId },
    });
    const ruangans = await prisma.ruangan.findMany({ where: { sekolahId } });

    const aset = asets.map((a) => ({
      ...a,
      gudang: gudangs.find((g) => g.id === a.gudangId) || null,
      kategoriAset: kategoris.find((k) => k.id === a.kategoriAsetId) || null,
      ruangan: (a as any).ruanganId
        ? ruangans.find((r) => r.id === (a as any).ruanganId) || null
        : null,
    }));
    return successResponse(res, "Berhasil mengambil data aset", aset, 200);
  } catch (error) {
    next(error);
  }
};

export const updateAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = asetSchema.parse(req.body);

    const existingAset = await prisma.aset.findFirst({
      where: {
        kode: validatedData.kode,
        sekolahId,
        id: { not: id },
        dihapusPada: null,
      },
    });
    if (existingAset) throw new AppError("Kode aset sudah digunakan", 400);

    const aset = await prisma.aset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!aset) throw new AppError("Aset tidak ditemukan", 404);

    const updated = await prisma.aset.update({
      where: { id },
      data: validatedData as any,
    });
    return successResponse(res, "Aset berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const aset = await prisma.aset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!aset) throw new AppError("Aset tidak ditemukan", 404);

    await prisma.aset.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Aset berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};