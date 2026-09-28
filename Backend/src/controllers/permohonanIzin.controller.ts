import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { paginatedResponse, successResponse } from "../utils/responseFormatter";
import { ajukanIzinSchema } from "../validations/permohonanIzin.validation";

export const ajukanIzin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const penggunaId = req.user?.userId;
    const sekolahId = req.user?.sekolahId;
    const file = req.file;

    if (!penggunaId || !sekolahId)
      throw new AppError("Data otentikasi tidak valid", 401);

    // 1. Zod otomatis memvalidasi req.body (menggantikan pengecekan if manual)
    const validated = ajukanIzinSchema.parse(req.body);

    // 2. Simpan ke database menggunakan data yang sudah tervalidasi
    const permohonan = await prisma.permohonanIzin.create({
      data: {
        sekolahId,
        penggunaId,
        jenis: validated.jenis,
        tanggalMulai: new Date(validated.tanggalMulai),
        tanggalSelesai: new Date(validated.tanggalSelesai),
        alasan: validated.alasan,
        urlBukti: file ? `/uploads/izin/${file.filename}` : null,
        status: "menunggu",
      },
    });

    return successResponse(
      res,
      "Permohonan izin berhasil diajukan",
      permohonan,
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const getDaftarIzin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const where: any = { sekolahId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, totalData] = await Promise.all([
      prisma.permohonanIzin.findMany({
        where,
        skip,
        take: limit,
        include: {
          pengguna: {
            select: { id: true, namaLengkap: true, nisn: true, nip: true },
          },
          penyetuju: { select: { id: true, namaLengkap: true } },
        },
        orderBy: { dibuatPada: "desc" },
      }),
      prisma.permohonanIzin.count({ where }),
    ]);

    return paginatedResponse(
      res,
      "Daftar permohonan izin berhasil diambil",
      data,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

export const verifikasiIzin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) throw new AppError("ID izin tidak valid", 400);

    const penyetujuId = req.user?.userId;
    const { status, catatan } = req.body; // status harus "disetujui" atau "ditolak"

    if (!["disetujui", "ditolak"].includes(status)) {
      throw new AppError("Status hanya boleh 'disetujui' atau 'ditolak'", 400);
    }

    const existing = await prisma.permohonanIzin.findUnique({ where: { id } });
    if (!existing) throw new AppError("Permohonan izin tidak ditemukan", 404);
    if (existing.status !== "menunggu")
      throw new AppError(`Permohonan sudah berstatus ${existing.status}`, 400);

    const izin = await prisma.permohonanIzin.update({
      where: { id },
      data: {
        status,
        catatan: catatan || null,
        penyetujuId,
      },
    });

    return successResponse(res, `Permohonan izin berhasil di-${status}`, izin);
  } catch (error) {
    next(error);
  }
};
