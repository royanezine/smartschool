import { Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { normalizeRole, canManageRole } from "../utils/rbac";
import { successResponse } from "../utils/responseFormatter";
import { registerFaceIdByAdmin } from "./absensi.controller";

const hapusFileReferensi = async (urlFotoReferensi?: string | null) => {
  if (!urlFotoReferensi) {
    return;
  }

  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const target = path.resolve(process.cwd() + urlFotoReferensi);

  if (!target.startsWith(uploadsRoot + path.sep)) {
    return;
  }

  await fs.promises.rm(target, { force: true });
};

export const registerFaceIdByParam = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id as string;

  if (!id) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return next(new AppError("ID pengguna tidak valid", 400));
  }

  req.body = { ...(req.body ?? {}), targetUserId: id };

  return registerFaceIdByAdmin(req, res, next);
};

export const deleteFaceId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      throw new AppError("ID pengguna tidak valid", 400);
    }

    const targetUser = await prisma.pengguna.findFirst({
      where: {
        id,
        dihapusPada: null,
      },
      select: {
        id: true,
        sekolahId: true,
        peran: {
          select: {
            nama: true,
          },
        },
        biometrikWajah: {
          select: {
            id: true,
            urlFotoReferensi: true,
          },
        },
      },
    });

    if (!targetUser) {
      throw new AppError("Pengguna tidak ditemukan", 404);
    }

    const actorRole = normalizeRole(req.user?.role);
    const targetRole = normalizeRole(targetUser.peran?.nama);

    if (actorRole !== "super_admin") {
      if (
        !targetUser.sekolahId ||
        targetUser.sekolahId !== req.user?.sekolahId
      ) {
        throw new AppError(
          "Akses ditolak: Pengguna berada di luar sekolah Anda",
          403,
          "FORBIDDEN",
        );
      }

      if (!canManageRole(actorRole, targetRole)) {
        throw new AppError(
          "Akses ditolak: Anda tidak dapat mengelola biometrik pengguna dengan level peran tersebut",
          403,
          "FORBIDDEN",
        );
      }
    }

    if (!targetUser.biometrikWajah) {
      throw new AppError("Face ID pengguna belum terdaftar", 404);
    }

    const { id: biometrikId, urlFotoReferensi } = targetUser.biometrikWajah;

    await prisma.biometrikWajah.delete({
      where: {
        id: biometrikId,
      },
    });

    await hapusFileReferensi(urlFotoReferensi);

    return successResponse(res, "Face ID berhasil dihapus", {
      penggunaId: targetUser.id,
    });
  } catch (error) {
    next(error);
  }
};