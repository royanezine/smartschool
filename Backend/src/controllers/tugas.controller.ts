import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
    createTugasSchema,
    updateTugasSchema,
    submitTugasSchema,
    nilaiTugasSchema,
} from "../validations/tugas.validation";

// guru CREATE TUGAS
export const createTugas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        const validated = createTugasSchema.parse(req.body);

        const kelasMapel = await prisma.kelasMapel.findFirst({
            where: {
                id: validated.kelasMapelId,
                guruPengajarId: userId,
            },
        });

        if (!kelasMapel) {
            throw new AppError("Kelas mapel tidak di temukan atau Anda bukan pengampu mapel ini", 403);
        }

        const tugas = await prisma.tugas.create({
            data: {
                kelasMapelId: validated.kelasMapelId,
                judul: validated.judul,
                deskripsi: validated.judul,
                batasWaktu: new Date(validated.batasWaktu),
                dibuatOleh: userId,
            },
        });
        
        return successResponse(res, "Tugas berhasil di buat", tugas, 201);
    } catch (error) {
        next(error);
    }
};

// GET TUGAS PER KELAS MAPEL 
export const getTugasByKelasMapel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const kelasMapelId = req.params.kelasMapelId as string;
        const data = await prisma.tugas.findMany({
            where: { kelasMapelId, dihapusPada: null },
            include: {
                _count: { select: { pengumpulanTugasSiswa: true } },
            },
            orderBy: { batasWaktu: "asc" },
        });
        return successResponse(res, "Berhasil mengambil daftar tugas", data);
    } catch (error) {
        next(error);
    }
};

// DETAIL TUGAS
export const getDetailTugas = async (req: Request, res: Response, next: NextFunction) => {
    try {
    const id = req.params.id as string;
    const userId = (req as AuthRequest).user?.userId;

    const tugas = await prisma.tugas.findFirst({
      where: { id, dihapusPada: null },
      include: {
        kelasMapel: {
          include: {
            mataPelajaran: true,
            kelas: true,
          },
        },
        pengumpulanTugasSiswa: {
            where: { penggunaId: userId },
            },
      },
    });
      
        if (!tugas) throw new AppError("Tugas tidak ditemukan", 404);
    return successResponse(res, "Berhasil mengambil detail tugas", tugas);
  } catch (error) {
    next(error);
  }
};

// GURU: UPDATE TUGAS
export const updateTugas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const validated = updateTugasSchema.parse(req.body);

    const tugas = await prisma.tugas.update({
      where: { id },
      data: {
        ...(validated.judul && { judul: validated.judul }),
        ...(validated.deskripsi !== undefined && { deskripsi: validated.deskripsi }),
        ...(validated.batasWaktu && { batasWaktu: new Date(validated.batasWaktu) }),
      },
    });

    return successResponse(res, "Tugas berhasil diperbarui", tugas);
  } catch (error) {
    next(error);
  }
};

// GURU DELETE TUGAS 
export const deleteTugas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.tugas.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });
    return successResponse(res, "Tugas berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

// SISWA: SUBMIT PENGUMPULAN TUGAS
export const submitTugas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tugasId = req.params.id as string;
    const userId = (req as AuthRequest).user?.userId as string;
    const validated = submitTugasSchema.parse(req.body);

    const tugas = await prisma.tugas.findFirst({
      where: { id: tugasId, dihapusPada: null },
    });

    if (!tugas) throw new AppError("Tugas tidak ditemukan", 404);

    const now = new Date();
    const statusPengumpulan = tugas.batasWaktu && now > tugas.batasWaktu ? "terlambat" : "dikumpulkan";

    const pengumpulan = await prisma.pengumpulanTugas.upsert({
      where: {
        // Asumsi relasi tugas-siswa
        id: (await prisma.pengumpulanTugas.findFirst({ where: { tugasId, penggunaId: userId } }))?.id || "new-id",
      },
      update: {
        urlFile: validated.urlFile,
        keterangan: validated.keterangan,
        status: statusPengumpulan,
        diperbaruiPada: now,
      },
      create: {
        tugasId,
        penggunaId: userId,
        urlFile: validated.urlFile,
        keterangan: validated.keterangan,
        status: statusPengumpulan,
        dibuatOleh: userId,
      },
    });

    return successResponse(res, `Tugas berhasil dikumpulkan (${statusPengumpulan})`, pengumpulan, 201);
  } catch (error) {
    next(error);
  }
};

// GURU: LIHAT PENGUMPULAN SISWA
export const getPengumpulanByTugas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tugasId = req.params.id as string;
    const data = await prisma.pengumpulanTugas.findMany({
      where: { tugasId },
      include: {
        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
            avatar: true,
          },
        },
      },
      orderBy: { dibuatPada: "asc" },
    });
    return successResponse(res, "Berhasil mengambil daftar pengumpulan siswa", data);
  } catch (error) {
    next(error);
  }
};

// GURU: INPUT NILAI TUGAS
export const beriNilaiTugas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pengumpulanId = req.params.pengumpulanId as string;
    const validated = nilaiTugasSchema.parse(req.body);

    const pengumpulan = await prisma.pengumpulanTugas.update({
      where: { id: pengumpulanId },
      data: {
        nilai: validated.nilai,
        keterangan: validated.keterangan,
        status: "dinilai",
      },
    });

    return successResponse(res, "Nilai tugas berhasil disimpan", pengumpulan);
  } catch (error) {
    next(error);
  }
};

