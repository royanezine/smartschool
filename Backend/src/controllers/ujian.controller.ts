import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createUjianSchema,
  updateUjianSchema,
  mulaiUjianSchema,
  submitUjianSchema,
} from "../validations/ujian.validation";

export const createUjian = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthRequest).user?.userId as string;
    const validated = createUjianSchema.parse(req.body);
    const generatedToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const checkKelasMapel = await prisma.kelasMapel.findFirst({
      where: { id: validated.kelasMapelId, guruPengajarId: userId },
    });

    if (!checkKelasMapel)
      throw new AppError(
        "Kelas mapel tidak ditemukan atau Anda bukan pengampunya",
        403,
      );

    const asesmen = await prisma.asesmen.create({
      data: {
        kelasMapelId: validated.kelasMapelId,
        judul: validated.judul,
        deskripsi: validated.deskripsi,
        tipe: validated.jenis,
        durasi: validated.durasi,
        waktuMulai: validated.waktuMulai
          ? new Date(validated.waktuMulai)
          : null,
        waktuSelesai: validated.waktuSelesai
          ? new Date(validated.waktuSelesai)
          : null,
        nilaiKelulusan: validated.nilaiKelulusan,
        modeAsesmen: validated.modeUjian,
        dipublikasikan: validated.dipublikasikan,
        penilaianOtomatis: validated.penilaianOtomatis,
        token: generatedToken,
        dibuatOleh: userId,
      },
    });

    return successResponse(res, "Ujian berhasil dibuat", asesmen, 201);
  } catch (error) {
    next(error);
  }
};

export const getUjianByKelasMapel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const kelasMapelId = req.params.kelasMapelId as string;
    const role = (req as AuthRequest).user?.role;

    const filter: any = { kelasMapelId, dihapusPada: null };
    if (role === "siswa") filter.dipublikasikan = true;

    const data = await prisma.asesmen.findMany({
      where: filter,
      include: {
        _count: { select: { soalAsesmen: true, percobaanAsesmen: true } },
      },
      orderBy: { dibuatPada: "desc" },
    });

    return successResponse(res, "Berhasil mengambil daftar ujian", data);
  } catch (error) {
    next(error);
  }
};

export const getDetailUjian = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const role = (req as AuthRequest).user?.role;

    const asesmen = await prisma.asesmen.findFirst({
      where: { id, dihapusPada: null },
      include: {
        kelasMapel: { include: { mataPelajaran: true, kelas: true } },
        soalAsesmen: {
          select: {
            id: true,
            teksSoal: true,
            jenisSoal: true,
            pilihan: true,
            poin: true,
            nomorUrut: true,
            kunciJawaban: role === "guru" ? true : false,
          },
          orderBy: { nomorUrut: "asc" },
        },
      },
    });

    if (!asesmen) throw new AppError("Ujian tidak ditemukan", 404);
    return successResponse(res, "Berhasil mengambil detail ujian", asesmen);
  } catch (error) {
    next(error);
  }
};

export const updateUjian = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const validated = updateUjianSchema.parse(req.body);

    const existing = await prisma.asesmen.findFirst({
      where: { id, dihapusPada: null },
    });
    if (!existing) throw new AppError("Ujian tidak ditemukan", 404);

    const asesmen = await prisma.asesmen.update({
      where: { id },
      data: {
        ...(validated.judul && { judul: validated.judul }),
        ...(validated.deskripsi !== undefined && {
          deskripsi: validated.deskripsi,
        }),
        ...(validated.jenis && { tipe: validated.jenis }),
        ...(validated.durasi !== undefined && { durasi: validated.durasi }),
        ...(validated.waktuMulai !== undefined && {
          waktuMulai: validated.waktuMulai
            ? new Date(validated.waktuMulai)
            : null,
        }),
        ...(validated.waktuSelesai !== undefined && {
          waktuSelesai: validated.waktuSelesai
            ? new Date(validated.waktuSelesai)
            : null,
        }),
        ...(validated.nilaiKelulusan !== undefined && {
          nilaiKelulusan: validated.nilaiKelulusan,
        }),
        ...(validated.dipublikasikan !== undefined && {
          dipublikasikan: validated.dipublikasikan,
        }),
      },
    });

    return successResponse(res, "Ujian berhasil diperbarui", asesmen);
  } catch (error) {
    next(error);
  }
};

export const deleteUjian = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.asesmen.findFirst({
      where: { id, dihapusPada: null },
    });
    if (!existing) throw new AppError("Ujian tidak ditemukan", 404);

    await prisma.asesmen.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });

    return successResponse(res, "Ujian berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

export const mulaiPercobaanUjian = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ujianId = req.params.id as string;
    const userId = (req as AuthRequest).user?.userId as string;
    const { token } = mulaiUjianSchema.parse(req.body);

    const asesmen = await prisma.asesmen.findFirst({
      where: { id: ujianId, dihapusPada: null, dipublikasikan: true },
    });

    if (!asesmen)
      throw new AppError(
        "Ujian tidak ditemukan atau belum dipublikasikan",
        404,
      );

    const now = new Date();
    if (asesmen.waktuMulai && now < asesmen.waktuMulai)
      throw new AppError("Waktu pelaksanaan ujian belum dimulai", 400);
    if (asesmen.waktuSelesai && now > asesmen.waktuSelesai)
      throw new AppError("Waktu pelaksanaan ujian telah berakhir", 400);
    const tokenSeharusnya =
      (asesmen as any).token ||
      asesmen.id.replace(/-/g, "").substring(0, 6).toUpperCase();

    if (token.trim().toUpperCase() !== tokenSeharusnya.trim().toUpperCase()) {
      throw new AppError("Token ujian tidak valid.", 400);
    }

    const existingSesi = await prisma.percobaanAsesmen.findFirst({
      where: { asesmenId: ujianId, siswaId: userId },
    });

    if (existingSesi) {
      if (existingSesi.status === "selesai")
        throw new AppError(
          "Anda sudah menyelesaikan ujian ini sebelumnya",
          400,
        );
      return successResponse(
        res,
        "Melanjutkan sesi ujian yang sedang berjalan",
        existingSesi,
      );
    }

    const sesiBaru = await prisma.percobaanAsesmen.create({
      data: {
        asesmenId: ujianId,
        siswaId: userId,
        dimulaiPada: now,
        status: "berlangsung",
        dibuatOleh: userId,
      },
    });

    return successResponse(res, "Sesi ujian berhasil dimulai", sesiBaru, 201);
  } catch (error) {
    next(error);
  }
};

export const submitJawabanDanSelesai = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sesiId = req.params.sesiId as string;
    const userId = (req as AuthRequest).user?.userId as string;
    const { jawaban } = submitUjianSchema.parse(req.body);

    const sesi = await prisma.percobaanAsesmen.findFirst({
      where: { id: sesiId, siswaId: userId },
      include: {
        asesmen: { include: { soalAsesmen: true } },
      },
    });

    if (!sesi) throw new AppError("Sesi ujian tidak ditemukan", 404);
    if (sesi.status === "selesai" || sesi.status === "dinilai")
      throw new AppError("Sesi ujian sudah dikumpulkan sebelumnya", 400);

    const soalList = sesi.asesmen.soalAsesmen;
    let totalPoinDiperoleh = 0;
    let totalPoinMaksimal = 0;
    let jumlahBenar = 0;
    let jumlahSalah = 0;
    let jumlahLewati = 0;

    const jawabanMap = new Map(jawaban.map((j) => [j.soalId, j.jawaban]));
    const payloadJawabanSiswa: any[] = [];

    for (const soal of soalList) {
      const poinSoal = Number(soal.poin) || 1;
      totalPoinMaksimal += poinSoal;

      const jawabanSiswa = jawabanMap.get(soal.id);

      if (!jawabanSiswa || jawabanSiswa.trim() === "") {
        jumlahLewati++;
        payloadJawabanSiswa.push({
          percobaanAsesmenId: sesi.id,
          soalId: soal.id,
          jawaban: null,
          nilai: 0,
          benar: false,
          dibuatOleh: userId,
        });
        continue;
      }

      if (
        soal.jenisSoal === "pilihan_ganda" ||
        soal.jenisSoal === "benar_salah"
      ) {
        const isBenar =
          soal.kunciJawaban?.trim().toUpperCase() ===
          jawabanSiswa.trim().toUpperCase();

        if (isBenar) {
          jumlahBenar++;
          totalPoinDiperoleh += poinSoal;
        } else {
          jumlahSalah++;
        }

        payloadJawabanSiswa.push({
          percobaanAsesmenId: sesi.id,
          soalId: soal.id,
          jawaban: jawabanSiswa,
          nilai: isBenar ? poinSoal : 0,
          benar: isBenar,
          dibuatOleh: userId,
        });
      } else {
        payloadJawabanSiswa.push({
          percobaanAsesmenId: sesi.id,
          soalId: soal.id,
          jawaban: jawabanSiswa,
          nilai: 0,
          benar: null,
          dibuatOleh: userId,
        });
      }
    }

    const nilaiSkala100 =
      totalPoinMaksimal > 0
        ? (totalPoinDiperoleh / totalPoinMaksimal) * 100
        : 0;

    const hasil = await prisma.$transaction(async (tx) => {
      await tx.jawabanAsesmen.createMany({ data: payloadJawabanSiswa });

      const hasilAsesmen = await tx.hasilAsesmen.create({
        data: {
          percobaanAsesmenId: sesi.id,
          totalNilai: Number(nilaiSkala100.toFixed(2)),
          jumlahBenar,
          jumlahSalah,
          jumlahLewati,
          dibuatOleh: userId,
        },
      });

      await tx.percobaanAsesmen.update({
        where: { id: sesi.id },
        data: {
          status: "selesai",
          selesaiPada: new Date(),
          nilai: Number(nilaiSkala100.toFixed(2)),
        },
      });

      return hasilAsesmen;
    });

    return successResponse(
      res,
      "Ujian berhasil diselesaikan. Nilai berhasil dikalkulasi.",
      hasil,
    );
  } catch (error) {
    next(error);
  }
};
