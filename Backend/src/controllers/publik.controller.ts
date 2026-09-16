import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

export const getPublicArtikel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subdomain = req.params.subdomain as string;
    
    const sekolah = await prisma.sekolah.findUnique({
      where: { subdomain },
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const artikel = await prisma.artikelCms.findMany({
      where: {
        sekolahId: sekolah.id,
        dihapusPada: null,
        status: { in: ["dipublikasikan", "aktif"] },
      },
      include: { kategoriArtikel: true },
      orderBy: { dibuatPada: "desc" },
    });

    return successResponse(res, "Berhasil mengambil artikel publik", artikel, 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicHalamanBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subdomain = req.params.subdomain as string;
    const slug = req.params.slug as string;

    const sekolah = await prisma.sekolah.findUnique({
      where: { subdomain },
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const halaman = await prisma.halamanCms.findFirst({
      where: {
        sekolahId: sekolah.id,
        slug,
        dihapusPada: null,
      },
    });
    if (!halaman) throw new AppError("Halaman tidak ditemukan", 404);

    return successResponse(res, "Berhasil mengambil halaman publik", halaman, 200);
  } catch (error) {
    next(error);
  }
};
