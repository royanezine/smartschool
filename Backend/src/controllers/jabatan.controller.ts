import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { DAFTAR_MENU_BAKU, DAFTAR_AKSI_MENU } from "../constants/menu.constant";
import {
  createJabatanSchema,
  updateJabatanSchema,
} from "../validations/jabatan.validation";

/**
 * Mengembalikan daftar konstan menu baku dan aksi yang didukung sistem
 * Digunakan frontend untuk me-render checkbox dinamis hak akses menu
 */
export const getMenuBaku = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    return successResponse(res, "Daftar menu baku dan aksi berhasil diambil", {
      menus: DAFTAR_MENU_BAKU,
      actions: DAFTAR_AKSI_MENU,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengambil semua data dari tabel Jabatan, di-include dengan count relasi pengguna
 */
export const getAllJabatan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await prisma.jabatan.findMany({
      include: {
        _count: {
          select: { pengguna: true },
        },
      },
      orderBy: {
        namaJabatan: "asc",
      },
    });

    return successResponse(res, "Daftar jabatan berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

/**
 * Mengambil detail satu jabatan berdasarkan ID
 */
export const getJabatanById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") {
      throw new AppError("ID jabatan tidak valid", 400, "BAD_REQUEST");
    }

    const jabatan = await prisma.jabatan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pengguna: true },
        },
      },
    });

    if (!jabatan) {
      throw new AppError("Jabatan tidak ditemukan", 404, "NOT_FOUND");
    }

    return successResponse(res, "Detail jabatan berhasil diambil", jabatan);
  } catch (error) {
    next(error);
  }
};

/**
 * Menyimpan jabatan baru menggunakan data dari validasi Zod
 * Menolak jika namaJabatan sudah ada
 */
export const createJabatan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = createJabatanSchema.parse(req.body);

    // Cek apakah nama jabatan sudah ada (case-insensitive)
    const existing = await prisma.jabatan.findFirst({
      where: {
        namaJabatan: {
          equals: validatedData.namaJabatan,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new AppError(
        `Jabatan dengan nama "${validatedData.namaJabatan}" sudah ada`,
        400,
        "DUPLICATE_JABATAN",
      );
    }

    const jabatan = await prisma.jabatan.create({
      data: {
        namaJabatan: validatedData.namaJabatan.trim(),
        deskripsi: validatedData.deskripsi ?? null,
        aksesMenu: (validatedData.aksesMenu ?? []) as Prisma.InputJsonValue,
      },
      include: {
        _count: {
          select: { pengguna: true },
        },
      },
    });

    return successResponse(res, "Jabatan berhasil dibuat", jabatan, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Memperbarui data jabatan dan aksesMenu-nya
 */
export const updateJabatan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") {
      throw new AppError("ID jabatan tidak valid", 400, "BAD_REQUEST");
    }

    const validatedData = updateJabatanSchema.parse(req.body);

    const existing = await prisma.jabatan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError("Jabatan tidak ditemukan", 404, "NOT_FOUND");
    }

    // Jika namaJabatan diubah, pastikan tidak duplikat dengan jabatan lain
    if (
      validatedData.namaJabatan &&
      validatedData.namaJabatan.toLowerCase() !== existing.namaJabatan.toLowerCase()
    ) {
      const duplicate = await prisma.jabatan.findFirst({
        where: {
          namaJabatan: {
            equals: validatedData.namaJabatan,
            mode: "insensitive",
          },
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new AppError(
          `Jabatan dengan nama "${validatedData.namaJabatan}" sudah digunakan`,
          400,
          "DUPLICATE_JABATAN",
        );
      }
    }

    const updated = await prisma.jabatan.update({
      where: { id },
      data: {
        ...(validatedData.namaJabatan
          ? { namaJabatan: validatedData.namaJabatan.trim() }
          : {}),
        ...(validatedData.deskripsi !== undefined
          ? { deskripsi: validatedData.deskripsi }
          : {}),
        ...(validatedData.aksesMenu !== undefined
          ? { aksesMenu: validatedData.aksesMenu as Prisma.InputJsonValue }
          : {}),
      },
      include: {
        _count: {
          select: { pengguna: true },
        },
      },
    });

    return successResponse(res, "Jabatan berhasil diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Menghapus jabatan
 * WAJIB validasi: Jika jabatan ini masih dipakai oleh Pengguna, tolak dengan 400 (Bad Request)
 */
export const deleteJabatan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== "string") {
      throw new AppError("ID jabatan tidak valid", 400, "BAD_REQUEST");
    }

    const jabatan = await prisma.jabatan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pengguna: true },
        },
      },
    });

    if (!jabatan) {
      throw new AppError("Jabatan tidak ditemukan", 404, "NOT_FOUND");
    }

    if (jabatan._count.pengguna > 0) {
      throw new AppError(
        `Jabatan "${jabatan.namaJabatan}" tidak dapat dihapus karena masih digunakan oleh ${jabatan._count.pengguna} pengguna`,
        400,
        "JABATAN_IN_USE",
      );
    }

    await prisma.jabatan.delete({
      where: { id },
    });

    return successResponse(
      res,
      `Jabatan "${jabatan.namaJabatan}" berhasil dihapus`,
      { id: jabatan.id, namaJabatan: jabatan.namaJabatan },
    );
  } catch (error) {
    next(error);
  }
};
