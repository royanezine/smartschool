import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

const prismaAny = prisma as any;

// SISWA/GURU: Ajukan Izin
export const ajukanIzin = async (req: AuthRequest, res: Response) => {
  try {
    const penggunaId = req.user!.userId;
    const sekolahId = req.user!.sekolahId!;
    const file = req.file; // Middleware multer untuk surat dokter/bukti

    const { jenis, tanggalMulai, tanggalSelesai, alasan } = req.body;

    const permohonan = await prisma.permohonanIzin.create({
      data: {
        sekolahId,
        penggunaId,
        jenis,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        alasan,
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
    throw new AppError("Gagal mengajukan izin", 500);
  }
};

// ADMIN: Verifikasi Izin (Approve/Reject)
export const verifikasiIzin = async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      throw new AppError("ID izin tidak valid", 400);
    }

    const { status, catatan } = req.body; // status: "disetujui" | "ditolak"
    const penyetujuId = req.user!.userId;

    const izin = await prisma.permohonanIzin.update({
      where: { id },
      data: {
        status,
        catatan,
        penyetujuId,
      },
    });

    // Opsional: Jika disetujui, otomatis inject data ke tabel Absensi (loop dari tglMulai s/d tglSelesai)

    return successResponse(res, `Izin berhasil di-${status}`, izin);
  } catch (error) {
    throw new AppError("Gagal memverifikasi izin", 500);
  }
};
