import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

const userSchema = z
  .object({
    namaLengkap: z.string().trim().min(2).max(100).optional(),
    noTelepon: z.string().trim().max(20).nullable().optional(),
  })
  .strict();

const yayasanSchema = z
  .object({
    nama: z.string().trim().min(3).max(100).optional(),
    npyp: z.string().trim().min(3).max(50).optional(),
    alamat: z.string().trim().max(10000).nullable().optional(),
    telepon: z.string().trim().max(20).nullable().optional(),
    email: z.string().trim().email().max(100).nullable().optional(),
  })
  .strict();

const lengkapSchema = z
  .object({
    user: userSchema.optional(),
    yayasan: yayasanSchema.optional(),
  })
  .strict();

const ambilKonteks = (req: AuthRequest) => {
  const user = req.user;
  if (!user?.yayasanId) {
    throw new AppError("Akun tidak terhubung dengan yayasan", 403);
  }
  return { userId: user.userId as string, yayasanId: user.yayasanId as string };
};

const simpanYayasan = async (
  tx: Prisma.TransactionClient,
  yayasanId: string,
  userId: string,
  data: z.infer<typeof yayasanSchema>,
) => {
  if (data.npyp) {
    const bentrok = await tx.yayasan.findFirst({
      where: { npyp: data.npyp, id: { not: yayasanId } },
      select: { id: true },
    });
    if (bentrok) throw new AppError("NPYP sudah digunakan yayasan lain", 409);
  }
  await tx.yayasan.update({
    where: { id: yayasanId },
    data: { ...data, diperbaruiOleh: userId },
  });
};

const simpanUser = async (
  tx: Prisma.TransactionClient,
  userId: string,
  data: z.infer<typeof userSchema>,
) => {
  await tx.pengguna.update({
    where: { id: userId },
    data: { ...data, diperbaruiOleh: userId },
  });
};

const tanganiError = (error: any, next: NextFunction) => {
  if (error?.code === "P2002") {
    return next(new AppError("Data sudah digunakan akun lain", 409));
  }
  return next(error);
};

export const getProfilLengkap = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, yayasanId } = ambilKonteks(req);
    const [user, yayasan] = await Promise.all([
      prisma.pengguna.findFirst({
        where: { id: userId, dihapusPada: null },
        select: { namaLengkap: true, email: true, noTelepon: true },
      }),
      prisma.yayasan.findFirst({
        where: { id: yayasanId, dihapusPada: null },
        select: {
          nama: true,
          npyp: true,
          alamat: true,
          telepon: true,
          email: true,
        },
      }),
    ]);
    if (!user) throw new AppError("Pengguna tidak ditemukan", 404);
    if (!yayasan) throw new AppError("Yayasan tidak ditemukan", 404);
    return successResponse(res, "Berhasil mengambil profil lengkap", {
      user,
      yayasan,
    });
  } catch (error) {
    return tanganiError(error, next);
  }
};

export const updateProfilLengkap = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, yayasanId } = ambilKonteks(req);
    const body = lengkapSchema.parse(req.body);
    if (!body.user && !body.yayasan) {
      throw new AppError("Tidak ada data yang diperbarui", 400);
    }
    await prisma.$transaction(async (tx) => {
      if (body.user) await simpanUser(tx, userId, body.user);
      if (body.yayasan) await simpanYayasan(tx, yayasanId, userId, body.yayasan);
    });
    return successResponse(res, "Profil berhasil diperbarui", null);
  } catch (error) {
    return tanganiError(error, next);
  }
};

export const getProfil = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { yayasanId } = ambilKonteks(req);
    const yayasan = await prisma.yayasan.findFirst({
      where: { id: yayasanId, dihapusPada: null },
      select: {
        nama: true,
        npyp: true,
        alamat: true,
        telepon: true,
        email: true,
      },
    });
    if (!yayasan) throw new AppError("Yayasan tidak ditemukan", 404);
    return successResponse(res, "Berhasil mengambil profil yayasan", yayasan);
  } catch (error) {
    return tanganiError(error, next);
  }
};

export const updateProfil = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, yayasanId } = ambilKonteks(req);
    const data = yayasanSchema.parse(req.body);
    if (Object.keys(data).length === 0) {
      throw new AppError("Tidak ada data yang diperbarui", 400);
    }
    await prisma.$transaction(async (tx) => {
      await simpanYayasan(tx, yayasanId, userId, data);
    });
    return successResponse(res, "Profil diperbarui", null);
  } catch (error) {
    return tanganiError(error, next);
  }
};