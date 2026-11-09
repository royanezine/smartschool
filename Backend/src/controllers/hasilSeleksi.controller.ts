import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

const STATUS_KELULUSAN = ["lulus", "tidak_lulus", "cadangan"] as const;

const parseAngka = (
  nilai: unknown,
  namaField: string,
): number | null | undefined => {
  if (nilai === undefined) {
    return undefined;
  }

  if (nilai === null || nilai === "") {
    return null;
  }

  const angka = Number(nilai);

  if (!Number.isFinite(angka)) {
    throw new AppError(`${namaField} harus berupa angka`, 400);
  }

  return angka;
};

const parseTeks = (nilai: unknown): string | null | undefined => {
  if (nilai === undefined) {
    return undefined;
  }

  if (nilai === null) {
    return null;
  }

  const teks = String(nilai).trim();

  return teks === "" ? null : teks;
};

export const simpanHasilSeleksi = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.userId as string | undefined;
    const sekolahId = (req as any).user?.sekolahId as string | undefined;

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    const body = req.body ?? {};

    const nilaiTes = parseAngka(body.nilaiTes, "nilaiTes");
    const peringkat = parseAngka(body.peringkat, "peringkat");
    const catatan = parseTeks(body.catatan);

    let statusKelulusan: string | null | undefined;

    if (body.statusKelulusan === undefined) {
      statusKelulusan = undefined;
    } else if (body.statusKelulusan === null || body.statusKelulusan === "") {
      statusKelulusan = null;
    } else {
      statusKelulusan = String(body.statusKelulusan).trim();

      if (!(STATUS_KELULUSAN as readonly string[]).includes(statusKelulusan)) {
        throw new AppError(
          `statusKelulusan harus salah satu dari: ${STATUS_KELULUSAN.join(", ")}`,
          400,
        );
      }
    }

    if (
      nilaiTes === undefined &&
      peringkat === undefined &&
      statusKelulusan === undefined &&
      catatan === undefined
    ) {
      throw new AppError(
        "Minimal satu field wajib diisi: nilaiTes, peringkat, statusKelulusan, catatan",
        400,
      );
    }

    if (typeof nilaiTes === "number" && (nilaiTes < 0 || nilaiTes > 100)) {
      throw new AppError("nilaiTes harus antara 0 sampai 100", 400);
    }

    if (
      typeof peringkat === "number" &&
      (!Number.isInteger(peringkat) || peringkat < 1)
    ) {
      throw new AppError("peringkat harus bilangan bulat minimal 1", 400);
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
      select: {
        id: true,
      },
    });

    if (!pendaftaran) {
      throw new AppError("Pendaftaran PPDB tidak ditemukan", 404);
    }

    const hasil = await prisma.hasilSeleksiPpdb.upsert({
      where: {
        pendaftaranPpdbId: pendaftaran.id,
      },
      create: {
        pendaftaranPpdbId: pendaftaran.id,
        nilaiTes: nilaiTes ?? null,
        peringkat: peringkat ?? null,
        statusKelulusan: statusKelulusan ?? null,
        catatan: catatan ?? null,
        dibuatOleh: adminId,
        diperbaruiOleh: adminId,
      },
      update: {
        nilaiTes,
        peringkat,
        statusKelulusan,
        catatan,
        diperbaruiOleh: adminId,
        dihapusPada: null,
        dihapusOleh: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Hasil seleksi PPDB berhasil disimpan",
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};

export const ambilHasilSeleksi = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const sekolahId = (req as any).user?.sekolahId as string | undefined;

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
      select: {
        id: true,
        nomorPendaftaran: true,
        namaLengkap: true,
        nisn: true,
        status: true,
        hasilSeleksiPpdb: true,
      },
    });

    if (!pendaftaran) {
      throw new AppError("Pendaftaran PPDB tidak ditemukan", 404);
    }

    const hasil =
      pendaftaran.hasilSeleksiPpdb && !pendaftaran.hasilSeleksiPpdb.dihapusPada
        ? pendaftaran.hasilSeleksiPpdb
        : null;

    return res.status(200).json({
      success: true,
      message: "Hasil seleksi PPDB berhasil diambil",
      data: {
        pendaftaranId: pendaftaran.id,
        nomorPendaftaran: pendaftaran.nomorPendaftaran,
        namaLengkap: pendaftaran.namaLengkap,
        nisn: pendaftaran.nisn,
        status: pendaftaran.status,
        hasilSeleksi: hasil,
      },
    });
  } catch (error) {
    next(error);
  }
};