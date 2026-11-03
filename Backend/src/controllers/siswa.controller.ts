import { studentProfiles } from "./studentProfile.controller";
import { publicUser } from "../utils/publicUser";
// src/controllers/siswa.controller.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";

export const getSiswaList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = {
      sekolahId,
      dihapusPada: null,
      peran: { nama: "siswa" },
    };

    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalData] = await Promise.all([
      prisma.pengguna.findMany({
        where,
        skip,
        take: limit,
        select: {
          pinHash: true,
          id: true,
          namaLengkap: true,
          email: true,
          nisn: true,
          nis: true,
          status: true,
        },
        orderBy: { dibuatPada: "desc" },
      }),
      prisma.pengguna.count({ where }),
    ]);

    return paginatedResponse(
      res,
      "Data siswa berhasil diambil",
      data.map(publicUser),
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

// === UPDATE SISWA ===
// Reuse the complete validated profile/enrollment transaction; do not drop
// parent fields by maintaining a separate, incomplete payload projection here.
export const updateSiswa = (req: AuthRequest, res: Response, next: NextFunction) =>
  studentProfiles(req, res, next);

export const deleteSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;

    await prisma.pengguna.update({
      where: { id, sekolahId },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
        status: "nonaktif",
      },
    });

    return successResponse(res, "Siswa berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

export const getMySiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: req.user?.userId,
        peran: { nama: "siswa" },
        dihapusPada: null,
      },
      select: {
          pinHash: true,
        id: true,
        namaLengkap: true,
        email: true,
        nisn: true,
        nis: true,
        status: true,
        jenisKelamin: true,
      },
    });

    if (!siswa) throw new AppError("Data siswa tidak ditemukan", 404);
    return successResponse(res, "Data siswa berhasil diambil", publicUser(siswa));
  } catch (error) {
    next(error);
  }
};

// Reuse the complete validated profile/enrollment transaction; do not drop
// parent fields by maintaining a separate, incomplete payload projection here.
export const createSiswa = (req: AuthRequest, res: Response, next: NextFunction) =>
  studentProfiles(req, res, next);

export const getSemuaSiswaAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const where: any = {
      sekolahId,
      dihapusPada: null,
      peran: { nama: "siswa" },
    };

    if (search) {
      where.OR = [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
        { nis: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, totalData] = await Promise.all([
      prisma.pengguna.findMany({
        where,
        skip,
        take: limit,
        select: {
          pinHash: true,
          id: true,
          namaLengkap: true,
          email: true,
          nisn: true,
          nis: true,
          status: true,
          jenisKelamin: true,
        },
        orderBy: { dibuatPada: "desc" },
      }),
      prisma.pengguna.count({ where }),
    ]);

    return paginatedResponse(
      res,
      "Data siswa berhasil diambil",
      data.map(publicUser),
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

// Reuse the complete validated profile/enrollment transaction; do not drop
// parent fields by maintaining a separate, incomplete payload projection here.
export const updateSiswaAdmin = (req: AuthRequest, res: Response, next: NextFunction) =>
  studentProfiles(req, res, next);

export const bulkImportSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const file = req.file;

    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    if (!file) throw new AppError("File excel wajib diunggah", 400);

    const peranSiswa = await prisma.peran.findFirst({
      where: {
        nama: "siswa",
        status: "aktif",
        dihapusPada: null,
        OR: [{ sekolahId }, { sekolahId: null }],
      },
      orderBy: {
        sekolahId: "desc",
      },
    });
    if (!peranSiswa) throw new AppError("Role siswa tidak ditemukan", 500);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new AppError("Sheet Excel tidak ditemukan", 400);

    const siswaMentah: Array<{
      namaLengkap: string;
      nisn: string;
      nis: string | null;
      email: string;
      jenisKelamin: string | null;
    }> = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const nisnRaw = row.getCell(2).value?.toString() || "";
        if (nisnRaw) {
          siswaMentah.push({
            namaLengkap: row.getCell(1).value?.toString() || "Tanpa Nama",
            nisn: nisnRaw,
            nis: row.getCell(3).value?.toString() || null,
            email:
              row.getCell(4).value?.toString() || `${nisnRaw}@student.local`,
            jenisKelamin: row.getCell(5).value?.toString() || null,
          });
        }
      }
    });

    const dataSiswaBaru = await Promise.all(
      siswaMentah.map(async (siswa) => ({
        sekolahId,
        peranId: peranSiswa.id,
        dibuatOleh: req.user?.userId,
        namaPengguna: siswa.nisn,
        kataSandi: await bcrypt.hash(siswa.nisn, 10),
        status: "aktif",
        ...siswa,
      })),
    );

    await prisma.pengguna.createMany({
      data: dataSiswaBaru,
      skipDuplicates: true,
    });

    const fs = await import("fs/promises");
    await fs.unlink(file.path);

    return successResponse(
      res,
      `Berhasil memproses import ${dataSiswaBaru.length} siswa`,
      null,
      201,
    );
  } catch (error) {
    next(error);
  }
};
