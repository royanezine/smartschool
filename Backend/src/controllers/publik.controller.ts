import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { bangunTema } from "../utils/temaDefault";
import { CMS_PUBLIC_STATUSES } from "../utils/cmsPublication";

const publicSchoolWhere = (subdomain: string) => ({
  subdomain, status: "aktif", dihapusPada: null,
});

const publicMenuSelect = {
  id: true,
  halamanCmsId: true,
  section: true,
  judul: true,
  subJudul: true,
  konten: true,
  gambarUrl: true,
  ctaText: true,
  ctaLink: true,
  urutan: true,
} as const;

export const getPublicProfil = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain as string;

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
      select: {
        id: true,
        nama: true,
        subdomain: true,
        npsn: true,
        jenjang: true,
        alamat: true,
        telepon: true,
        email: true,
        kode: true,
        logoBesarUrl: true,
        logoKecilUrl: true,
        faviconUrl: true,
        status: true,
        halamanCms: {
          where: {
            status: { in: [...CMS_PUBLIC_STATUSES] },
            dihapusPada: null,
          },
          select: {
            id: true,
            judul: true,
            slug: true,
            menuKonfigurasi: {
              where: { status: "aktif", sekolah: { subdomain } },
              select: publicMenuSelect,
              orderBy: [{ urutan: "asc" }, { id: "asc" }],
            },
          },
        },
      },
    });

    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    return successResponse(
      res,
      "Berhasil mengambil profil sekolah publik",
      {
        ...sekolah,
        daftarCms: sekolah.halamanCms,
      },
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicTema = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain as string;

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
      select: { id: true },
    });

    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const overrides = await prisma.pengaturanSistem.findMany({
      where: {
        sekolahId: sekolah.id,
        kelompok: { in: ["tema_warna", "warna_tema"] },
        dihapusPada: null,
      },
      select: { kunci: true, nilai: true },
    });

    const normalizedOverrides = overrides.map((o) => {
      if (o.kunci.startsWith("warna.")) return o;
      const parts = o.kunci.split(".");
      if (parts.length === 2) {
        return { kunci: `warna.${parts[0]}.${parts[1]}`, nilai: o.nilai };
      }
      if (parts.length === 1) {
        return { kunci: `warna.tema.${parts[0]}`, nilai: o.nilai };
      }
      return o;
    });

    const tema = bangunTema(normalizedOverrides);

    return successResponse(
      res,
      "Berhasil mengambil tema sekolah publik",
      tema,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicArtikel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain as string;

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const artikel = await prisma.artikelCms.findMany({
      where: {
        sekolahId: sekolah.id,
        dihapusPada: null,
        status: { in: [...CMS_PUBLIC_STATUSES] },
      },
      include: { kategoriArtikel: true },
      orderBy: { dibuatPada: "desc" },
    });

    return successResponse(
      res,
      "Berhasil mengambil artikel publik",
      artikel,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicHalamanBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain as string;
    const slug = req.params.slug as string;

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const halaman = await prisma.halamanCms.findFirst({
      where: {
        sekolahId: sekolah.id,
        slug,
        dihapusPada: null,
        status: { in: [...CMS_PUBLIC_STATUSES] },
      },
      include: {
        menuKonfigurasi: {
          where: { sekolahId: sekolah.id, status: "aktif" },
          select: publicMenuSelect,
          orderBy: [{ urutan: "asc" }, { id: "asc" }],
        },
      },
    });
    if (!halaman) throw new AppError("Halaman tidak ditemukan", 404);

    return successResponse(
      res,
      "Berhasil mengambil halaman publik",
      halaman,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getHalamanPublikBySubdomain = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain || req.query.subdomain;

    if (!subdomain || typeof subdomain !== "string") {
      throw new AppError("Subdomain wajib disertakan", 400);
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
      select: { id: true, status: true },
    });

    if (!sekolah || sekolah.status !== "aktif") {
      throw new AppError(
        "Sekolah tidak ditemukan atau sedang tidak aktif",
        404,
      );
    }

    const halaman = await prisma.halamanCms.findMany({
      where: {
        sekolahId: sekolah.id,
        dihapusPada: null,
        status: { in: [...CMS_PUBLIC_STATUSES] },
      },
      select: {
        id: true,
        judul: true,
        slug: true,
        menuKonfigurasi: {
          where: { sekolahId: sekolah.id, status: "aktif" },
          select: publicMenuSelect,
          orderBy: [{ urutan: "asc" }, { id: "asc" }],
        },
      },
      orderBy: { dibuatPada: "asc" },
    });

    return successResponse(
      res,
      "Berhasil mengambil daftar halaman publik",
      halaman,
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const getKonfigurasiPublikBySubdomain = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subdomain = req.params.subdomain || req.query.subdomain;

    if (!subdomain || typeof subdomain !== "string") {
      throw new AppError("Subdomain wajib disertakan", 400);
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: publicSchoolWhere(subdomain),
      select: { id: true, status: true },
    });

    if (!sekolah || sekolah.status !== "aktif") {
      throw new AppError(
        "Sekolah tidak ditemukan atau sedang tidak aktif",
        404,
      );
    }

    const konfigurasi = await prisma.menuKonfigurasi.findMany({
      where: {
        sekolahId: sekolah.id,
        status: "aktif",
        halamanCms: {
          sekolahId: sekolah.id,
          dihapusPada: null,
          status: { in: [...CMS_PUBLIC_STATUSES] },
        },
      },
      select: {
        ...publicMenuSelect,
        halamanCms: { select: { id: true, judul: true, slug: true } },
      },
      orderBy: [{ halamanCmsId: "asc" }, { urutan: "asc" }, { id: "asc" }],
    });

    const formattedConfig = konfigurasi.reduce((acc: any, curr) => {
      if (!acc[curr.halamanCmsId]) {
        acc[curr.halamanCmsId] = Object.create(null);
      }
      acc[curr.halamanCmsId][curr.section] = curr;
      return acc;
    }, Object.create(null));

    return successResponse(
      res,
      "Berhasil mengambil konfigurasi halaman",
      formattedConfig,
      200,
    );
  } catch (error) {
    next(error);
  }
};
