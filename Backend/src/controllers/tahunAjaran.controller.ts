import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  createTahunAjaranSchema,
  updateTahunAjaranSchema,
} from "../validations/tahunAjaran.validation";

const getParamId = (req: AuthRequest): string | null => {
  const { id } = req.params;
  if (typeof id !== "string" || !id) return null;
  return id;
};

export const getTahunAjaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    const data = await prisma.tahunAjaran.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      orderBy: {
        tahunAjaran: "desc",
      },
    });

    return successResponse(res, "Berhasil mengambil data tahun ajaran", data);
  } catch (error) {
    next(error);
  }
};

export const createTahunAjaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    const { nama, semester, status = "tidak_aktif" } = createTahunAjaranSchema.parse(req.body);

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        tahunAjaran: nama,
        semester,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (existing) {
      throw new AppError("Tahun ajaran dan semester tersebut sudah ada", 409);
    }

    if (status === "aktif") {
      await prisma.tahunAjaran.updateMany({
        where: {
          sekolahId,
          status: "aktif",
          dihapusPada: null,
        },
        data: {
          status: "tidak_aktif",
        },
      });
    }

    const data = await prisma.tahunAjaran.create({
      data: {
        tahunAjaran: nama,
        semester,
        status,
        sekolahId,
      },
    });

    return successResponse(res, "Tahun ajaran berhasil ditambahkan", data, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTahunAjaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = getParamId(req);

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    if (!id) {
      throw new AppError("ID tahun ajaran tidak valid", 400);
    }

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    const { nama, semester, status } = updateTahunAjaranSchema.parse(req.body);

    if (status === "aktif") {
      await prisma.tahunAjaran.updateMany({
        where: {
          sekolahId,
          id: {
            not: id,
          },
          status: "aktif",
          dihapusPada: null,
        },
        data: {
          status: "tidak_aktif",
        },
      });
    }

    const data = await prisma.tahunAjaran.update({
      where: {
        id,
      },
      data: {
        ...(nama && {
          tahunAjaran: nama,
        }),
        ...(semester && {
          semester,
        }),
        ...(status && {
          status,
        }),
      },
    });

    return successResponse(res, "Tahun ajaran berhasil diperbarui", data);
  } catch (error) {
    next(error);
  }
};

export const deleteTahunAjaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = getParamId(req);

    if (!sekolahId) {
      throw new AppError("Sekolah tidak ditemukan", 400);
    }

    if (!id) {
      throw new AppError("ID tahun ajaran tidak valid", 400);
    }

    const existing = await prisma.tahunAjaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    await prisma.tahunAjaran.update({
      where: {
        id,
      },
      data: {
        dihapusPada: new Date(),
        status: "tidak_aktif",
      },
    });

    return successResponse(res, "Tahun ajaran berhasil dihapus");
  } catch (error) {
    next(error);
  }
};