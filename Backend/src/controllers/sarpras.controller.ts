import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  gudangSchema,
  kategoriAsetSchema,
  asetSchema,
} from "../validations/sarpras.validation";

// === GUDANG ===
export const createGudang = async (req: Request, res: Response, next: NextFunction) => {
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

export const getGudang = async (req: Request, res: Response, next: NextFunction) => {
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

export const updateGudang = async (req: Request, res: Response, next: NextFunction) => {
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

export const deleteGudang = async (req: Request, res: Response, next: NextFunction) => {
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

// === KATEGORI ASET ===
export const createKategoriAset = async (req: Request, res: Response, next: NextFunction) => {
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

export const getKategoriAset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const kategori = await prisma.kategoriAset.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    return successResponse(res, "Berhasil mengambil kategori aset", kategori, 200);
  } catch (error) {
    next(error);
  }
};

export const updateKategoriAset = async (req: Request, res: Response, next: NextFunction) => {
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
    
    return successResponse(res, "Kategori aset berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteKategoriAset = async (req: Request, res: Response, next: NextFunction) => {
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

// === ASET ===
export const createAset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = asetSchema.parse(req.body);

    const existingAset = await prisma.aset.findFirst({
      where: { kode: validatedData.kode, sekolahId, dihapusPada: null },
    });
    if (existingAset) throw new AppError("Kode aset sudah digunakan", 400);

    const aset = await prisma.aset.create({
      data: { ...validatedData, sekolahId },
    });
    return successResponse(res, "Aset berhasil dibuat", aset, 201);
  } catch (error) {
    next(error);
  }
};

export const getAset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const asets = await prisma.aset.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    
    const gudangs = await prisma.gudang.findMany({ where: { sekolahId }});
    const kategoris = await prisma.kategoriAset.findMany({ where: { sekolahId }});
    
    const aset = asets.map(a => ({
      ...a,
      gudang: gudangs.find(g => g.id === a.gudangId) || null,
      kategoriAset: kategoris.find(k => k.id === a.kategoriAsetId) || null
    }));
    return successResponse(res, "Berhasil mengambil data aset", aset, 200);
  } catch (error) {
    next(error);
  }
};

export const updateAset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = asetSchema.parse(req.body);

    const existingAset = await prisma.aset.findFirst({
      where: { kode: validatedData.kode, sekolahId, id: { not: id }, dihapusPada: null },
    });
    if (existingAset) throw new AppError("Kode aset sudah digunakan", 400);

    const aset = await prisma.aset.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!aset) throw new AppError("Aset tidak ditemukan", 404);

    const updated = await prisma.aset.update({
      where: { id },
      data: validatedData,
    });
    return successResponse(res, "Aset berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAset = async (req: Request, res: Response, next: NextFunction) => {
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
