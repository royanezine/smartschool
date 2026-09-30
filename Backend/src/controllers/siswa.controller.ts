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
      data,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

// === UPDATE SISWA ===
export const updateSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const { namaLengkap, email, nis, nisn, status } = req.body;

    const siswa = await prisma.pengguna.update({
      where: { id, sekolahId },
      data: {
        namaLengkap,
        email,
        nis,
        nisn,
        status,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Data siswa berhasil diperbarui", siswa);
  } catch (error) {
    next(error);
  }
};

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
    return successResponse(res, "Data siswa berhasil diambil", siswa);
  } catch (error) {
    next(error);
  }
};

export const createSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const {
      namaPengguna,
      email,
      kataSandi,
      namaLengkap,
      nisn,
      nis,
      jenisKelamin,
    } = req.body;

    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    if (!namaPengguna || !email || !kataSandi || !namaLengkap) {
      throw new AppError(
        "Username, email, kata sandi, dan nama lengkap wajib diisi",
        400,
      );
    }

    const peranSiswa = await prisma.peran.findFirst({
      where: { nama: "siswa", sekolahId },
    });
    if (!peranSiswa) throw new AppError("Role siswa tidak ditemukan", 500);

    const passwordHash = await bcrypt.hash(kataSandi, 10);
    const siswa = await prisma.pengguna.create({
      data: {
        sekolahId,
        peranId: peranSiswa.id,
        namaPengguna,
        email,
        kataSandi: passwordHash,
        namaLengkap,
        nisn: nisn || null,
        nis: nis || null,
        jenisKelamin: jenisKelamin || null,
        status: "aktif",
        dibuatOleh: req.user?.userId,
      },
      select: {
        id: true,
        namaPengguna: true,
        email: true,
        namaLengkap: true,
        nisn: true,
        nis: true,
        status: true,
      },
    });

    return successResponse(res, "Data siswa berhasil dibuat", siswa, 201);
  } catch (error) {
    next(error);
  }
};

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
      data,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

export const updateSiswaAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const sekolahId = (req as AuthRequest).user?.sekolahId;
    const { namaLengkap, email, nis, nisn, status, jenisKelamin, noTelepon } =
      req.body;

    const siswa = await prisma.pengguna.update({
      where: { id, sekolahId },
      data: {
        namaLengkap,
        email,
        nis,
        nisn,
        status,
        jenisKelamin,
        noTelepon,
        diperbaruiOleh: (req as AuthRequest).user?.userId,
      },
    });
    return successResponse(res, "Data siswa berhasil diperbarui", siswa);
  } catch (error) {
    next(error);
  }
};

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
      where: { nama: "siswa" },
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
