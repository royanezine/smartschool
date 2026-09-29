import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  kategoriArtikelSchema,
  artikelCmsSchema,
  halamanCmsSchema,
} from "../validations/cms.validation";
import { temaWarnaSchema } from "../validations/tema.validation";
import {
  KELOMPOK_TEMA,
  bangunTema,
  normalisasiHex,
} from "../utils/temaDefault";

// === KATEGORI ARTIKEL ===
export const createKategoriArtikel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = kategoriArtikelSchema.parse(req.body);
    const slug = validatedData.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const kategori = await prisma.kategoriArtikel.create({
      data: { ...validatedData, slug, sekolahId },
    });
    return successResponse(res, "Kategori artikel berhasil dibuat", kategori, 201);
  } catch (error) {
    next(error);
  }
};

export const getKategoriArtikel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const kategori = await prisma.kategoriArtikel.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    return successResponse(res, "Berhasil mengambil kategori artikel", kategori, 200);
  } catch (error) {
    next(error);
  }
};

export const updateKategoriArtikel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = kategoriArtikelSchema.parse(req.body);
    const slug = validatedData.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const kategori = await prisma.kategoriArtikel.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!kategori) throw new AppError("Kategori artikel tidak ditemukan", 404);

    const updated = await prisma.kategoriArtikel.update({
      where: { id },
      data: { ...validatedData, slug },
    });
    return successResponse(res, "Kategori artikel berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteKategoriArtikel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const kategori = await prisma.kategoriArtikel.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!kategori) throw new AppError("Kategori artikel tidak ditemukan", 404);

    await prisma.kategoriArtikel.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Kategori artikel berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

// === ARTIKEL CMS ===
export const createArtikelCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = artikelCmsSchema.parse(req.body);
    const slug = validatedData.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const artikel = await prisma.artikelCms.create({
      data: { ...validatedData, slug, sekolahId },
    });
    return successResponse(res, "Artikel berhasil dibuat", artikel, 201);
  } catch (error) {
    next(error);
  }
};

export const getArtikelCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const artikel = await prisma.artikelCms.findMany({
      where: { sekolahId, dihapusPada: null },
      include: { kategoriArtikel: true },
    });
    return successResponse(res, "Berhasil mengambil artikel", artikel, 200);
  } catch (error) {
    next(error);
  }
};

export const updateArtikelCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = artikelCmsSchema.parse(req.body);
    const slug = validatedData.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const artikel = await prisma.artikelCms.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!artikel) throw new AppError("Artikel tidak ditemukan", 404);

    const updated = await prisma.artikelCms.update({
      where: { id },
      data: { ...validatedData, slug },
    });
    return successResponse(res, "Artikel berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteArtikelCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const artikel = await prisma.artikelCms.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!artikel) throw new AppError("Artikel tidak ditemukan", 404);

    await prisma.artikelCms.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Artikel berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

// === HALAMAN CMS ===
export const createHalamanCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = halamanCmsSchema.parse(req.body);
    const slug = validatedData.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const halaman = await prisma.halamanCms.create({
      data: { ...validatedData, slug, sekolahId },
    });
    return successResponse(res, "Halaman berhasil dibuat", halaman, 201);
  } catch (error) {
    next(error);
  }
};

export const getHalamanCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId;
    const halaman = await prisma.halamanCms.findMany({
      where: { sekolahId, dihapusPada: null },
    });
    return successResponse(res, "Berhasil mengambil halaman", halaman, 200);
  } catch (error) {
    next(error);
  }
};

export const updateHalamanCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;
    const validatedData = halamanCmsSchema.parse(req.body);
    const slug = validatedData.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const halaman = await prisma.halamanCms.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!halaman) throw new AppError("Halaman tidak ditemukan", 404);

    const updated = await prisma.halamanCms.update({
      where: { id },
      data: { ...validatedData, slug },
    });
    return successResponse(res, "Halaman berhasil diperbarui", updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteHalamanCms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as any).user.sekolahId;

    const halaman = await prisma.halamanCms.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!halaman) throw new AppError("Halaman tidak ditemukan", 404);

    await prisma.halamanCms.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Halaman berhasil dihapus", null, 200);
  } catch (error) {
    next(error);
  }
};

// === TEMA WARNA (dikonsumsi FE) ===

// GET /cms/tema -> default + override sekolah, format hex & rgb
export const getTemaWarna = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sekolahId = (req as any).user.sekolahId as string | undefined;

    const overrides = sekolahId
      ? await prisma.pengaturanSistem.findMany({
          where: { sekolahId, kelompok: KELOMPOK_TEMA, dihapusPada: null },
          select: { kunci: true, nilai: true },
        })
      : [];

    return successResponse(res, "Berhasil mengambil tema warna", bangunTema(overrides), 200);
  } catch (error) {
    next(error);
  }
};

// PUT /cms/tema -> simpan/ubah warna (parsial, hanya yang dikirim)
export const updateTemaWarna = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sekolahId, userId } = (req as any).user;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const validated = temaWarnaSchema.parse(req.body);

    const existing = await prisma.pengaturanSistem.findMany({
      where: { sekolahId, kelompok: KELOMPOK_TEMA, dihapusPada: null },
      select: { id: true, kunci: true },
    });
    const idByKunci = new Map(existing.map((e) => [e.kunci, e.id]));

    const ops: Prisma.PrismaPromise<unknown>[] = [];

    for (const [group, warna] of Object.entries(validated)) {
      if (!warna) continue;
      for (const [key, value] of Object.entries(warna)) {
        const kunci = `warna.${group}.${key}`;
        const hex = normalisasiHex(value);
        const existingId = idByKunci.get(kunci);

        if (existingId) {
          ops.push(
            prisma.pengaturanSistem.update({
              where: { id: existingId },
              data: { nilai: hex, diperbaruiOleh: userId },
            }),
          );
        } else {
          ops.push(
            prisma.pengaturanSistem.create({
              data: {
                sekolahId,
                kunci,
                nilai: hex,
                tipeData: "color",
                kelompok: KELOMPOK_TEMA,
                keterangan: `Warna ${group}.${key}`,
                dibuatOleh: userId,
              },
            }),
          );
        }
      }
    }

    await prisma.$transaction(ops);

    const overrides = await prisma.pengaturanSistem.findMany({
      where: { sekolahId, kelompok: KELOMPOK_TEMA, dihapusPada: null },
      select: { kunci: true, nilai: true },
    });

    return successResponse(res, "Tema warna berhasil diperbarui", bangunTema(overrides), 200);
  } catch (error) {
    next(error);
  }
};

// DELETE /cms/tema -> reset ke warna default
export const resetTemaWarna = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sekolahId, userId } = (req as any).user;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    await prisma.pengaturanSistem.updateMany({
      where: { sekolahId, kelompok: KELOMPOK_TEMA, dihapusPada: null },
      data: { dihapusPada: new Date(), dihapusOleh: userId },
    });

    return successResponse(res, "Tema warna dikembalikan ke default", bangunTema([]), 200);
  } catch (error) {
    next(error);
  }
};