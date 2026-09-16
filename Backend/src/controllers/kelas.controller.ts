import { Request, Response } from "express";
import { prisma } from "../config/db";
import {
  createKelasSchema,
  updateKelasSchema,
} from "../validations/kelas.Validation";
import { paginatedResponse, successResponse } from "../utils/responseFormatter";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getKelas = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tahunAjaranId = req.query.tahunAjaranId as string;
    const tingkat = req.query.tingkat
      ? parseInt(req.query.tingkat as string)
      : undefined;
    const sortBy = (req.query.sortBy as string) || "tingkat";
    const sortOrder = (req.query.sortOrder as string) || "asc";

    const skip = (page - 1) * limit;

    const whereClause: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (tahunAjaranId) whereClause.tahunAjaranId = tahunAjaranId;
    if (tingkat !== undefined) whereClause.tingkat = tingkat;

    if (search) {
      whereClause.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        {
          waliKelas: { namaLengkap: { contains: search, mode: "insensitive" } },
        },
      ];
    }

    const [data, totalData] = await Promise.all([
      prisma.kelas.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          tahunAjaran: true,
          waliKelas: {
            select: {
              id: true,
              namaLengkap: true,
              email: true,
              nip: true,
            },
          },
          lantai: {
            include: {
              gedung: {
                select: { id: true, nama: true, kode: true },
              },
            },
          },
          _count: {
            select: {
              anggota: true,
              kelasMapel: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.kelas.count({ where: whereClause }),
    ]);

    return paginatedResponse(
      res,
      "Berhasil mengambil data kelas",
      data,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getDetailKelas = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;

    const kelas = await prisma.kelas.findFirst({
      where: { id, sekolahId, dihapusPada: null },
      include: {
        tahunAjaran: true,
        waliKelas: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            nip: true,
            noTelepon: true,
          },
        },
        lantai: {
          include: { gedung: true },
        },
        anggota: {
          include: {
            siswa: {
              select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                nis: true,
                jenisKelamin: true,
                avatar: true,
              },
            },
          },
        },
        kelasMapel: {
          where: { dihapusPada: null },
          include: {
            mataPelajaran: true,
            guruPengajar: {
              select: { id: true, namaLengkap: true, nip: true },
            },
            jadwalMengajar: {
              where: { dihapusPada: null },
            },
          },
        },
      },
    });

    if (!kelas) throw new AppError("Kelas tidak ditemukan", 404);

    return successResponse(res, "Berhasil mengambil detail kelas", kelas);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const createKelas = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const validated = createKelasSchema.parse(req.body);

    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
      select: { jenjang: true },
    });
    if (!sekolah) throw new AppError("Sekolah tidak ditemukan", 404);

    const jenjang = (sekolah.jenjang || "").toUpperCase();
    let tingkatValid = true;
    if (jenjang === "SD")
      tingkatValid = validated.tingkat >= 1 && validated.tingkat <= 6;
    else if (jenjang === "SMP")
      tingkatValid = validated.tingkat >= 7 && validated.tingkat <= 9;
    else if (jenjang === "SMA" || jenjang === "SMK")
      tingkatValid = validated.tingkat >= 10 && validated.tingkat <= 12;

    if (!tingkatValid) {
      throw new AppError(
        `Tingkat ${validated.tingkat} tidak valid untuk jenjang ${jenjang}`,
        400,
      );
    }

    // Validasi Duplikasi Nama di Tahun Ajaran yang sama
    const existing = await prisma.kelas.findFirst({
      where: {
        nama: validated.nama,
        tahunAjaranId: validated.tahunAjaranId,
        sekolahId,
        dihapusPada: null,
      },
    });
    if (existing)
      throw new AppError(
        "Kelas dengan nama tersebut sudah terdaftar di tahun ajaran ini",
        409,
      );

    const data = await prisma.kelas.create({
      data: {
        nama: validated.nama,
        tingkat: String(validated.tingkat),
        tahunAjaranId: validated.tahunAjaranId,
        waliKelasId: validated.waliKelasId || null,
        kapasitas: validated.kapasitas,
        fotoKelas: validated.fotoKelasUrl || null,
        lantaiId: validated.lantaiId || null,
        sekolahId,
      },
    });

    return successResponse(res, "Kelas berhasil ditambahkan", data, 201);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: (error as Error).message || "Internal server error",
      });
  }
};

export const updateKelas = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = req.params.id as string;

    const existing = await prisma.kelas.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!existing) throw new AppError("Kelas tidak ditemukan", 404);

    const validated = updateKelasSchema.parse(req.body);
    const { tingkat, fotoKelasUrl, ...rest } = validated;

    const data = await prisma.kelas.update({
      where: { id },
      data: {
        ...rest,
        ...(tingkat !== undefined && { tingkat: String(tingkat) }),
        ...(fotoKelasUrl !== undefined && { fotoKelas: fotoKelasUrl }),
      },
    });

    return successResponse(res, "Kelas berhasil diperbarui", data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: (error as Error).message || "Internal server error",
      });
  }
};

export const deleteKelas = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = req.params.id as string;

    const existing = await prisma.kelas.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });
    if (!existing) throw new AppError("Kelas tidak ditemukan", 404);

    await prisma.kelas.update({
      where: { id },
      data: { dihapusPada: new Date() },
    });

    return successResponse(res, "Kelas berhasil dihapus");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
