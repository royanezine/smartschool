import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

export const getDataRaportSiswa = async (req: AuthRequest, res: Response) => {
  try {
    const siswaId = Array.isArray(req.params.siswaId)
      ? req.params.siswaId[0]
      : req.params.siswaId;
    const tahunAjaranId = Array.isArray(req.params.tahunAjaranId)
      ? req.params.tahunAjaranId[0]
      : req.params.tahunAjaranId;
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);
    if (!siswaId || !tahunAjaranId)
      throw new AppError("Parameter siswa atau tahun ajaran tidak valid", 400);

    // 1. Ambil Profil Siswa & Kelas
    const siswa = await prisma.pengguna.findFirst({
      where: { id: siswaId, sekolahId },
      include: {
        kelasSiswa: {
          where: { tahunAjaranId },
          include: { kelas: true },
        },
      },
    });

    if (!siswa) throw new AppError("Data siswa tidak ditemukan", 404);

    const kelasSiswa = siswa.kelasSiswa[0]?.kelas;
    if (!kelasSiswa)
      throw new AppError(
        "Siswa tidak terdaftar di kelas pada tahun ajaran ini",
        404,
      );

    // 2. Ambil Nilai Akhir Per Mata Pelajaran
    const nilai = await prisma.nilai.findMany({
      where: {
        penggunaId: siswaId,
        kelasMapel: { kelasId: kelasSiswa.id },
      },
      include: {
        kelasMapel: { include: { mataPelajaran: true } },
        komponenNilai: true,
      },
    });

    // Proses agregasi nilai per mapel
    const rekapNilai: Record<
      string,
      { mapel: string; totalNilai: number; kkm: number }
    > = {};
    nilai.forEach((n) => {
      const namaMapel = n.kelasMapel.mataPelajaran.nama;
      if (!rekapNilai[namaMapel]) {
        rekapNilai[namaMapel] = { mapel: namaMapel, totalNilai: 0, kkm: 75 }; // Asumsi KKM 75
      }
      // Hitung bobot nilai jika ada
      const bobot = Number(n.komponenNilai.bobot) / 100;
      rekapNilai[namaMapel].totalNilai += Number(n.nilai) * bobot;
    });

    // 3. Rekap Absensi
    const absensi = await prisma.absensi.groupBy({
      by: ["status"],
      where: {
        penggunaId: siswaId,
        kelasId: kelasSiswa.id,
      },
      _count: true,
    });

    const rekapAbsensi = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    absensi.forEach((a) => {
      if (a.status.toLowerCase() === "h") rekapAbsensi.hadir = a._count;
      if (a.status.toLowerCase() === "i") rekapAbsensi.izin = a._count;
      if (a.status.toLowerCase() === "s") rekapAbsensi.sakit = a._count;
      if (a.status.toLowerCase() === "a") rekapAbsensi.alpha = a._count;
    });

    // 4. Catatan Wali Kelas (Opsional, jika skema mencakup tabel catatan)
    const catatanWaliKelas =
      "Anak yang rajin dan berprestasi, tingkatkan belajarnya.";

    return successResponse(res, "Data raport berhasil diagregasi", {
      identitas: {
        nama: siswa.namaLengkap,
        nisn: siswa.nisn,
        nis: siswa.nis,
        kelas: kelasSiswa.nama,
      },
      akademik: Object.values(rekapNilai).map((n) => ({
        ...n,
        totalNilai: Math.round(n.totalNilai),
        predikat:
          n.totalNilai >= 90
            ? "A"
            : n.totalNilai >= 80
              ? "B"
              : n.totalNilai >= 75
                ? "C"
                : "D",
      })),
      kehadiran: rekapAbsensi,
      catatanWaliKelas,
    });
  } catch (error) {
    console.error("Raport Data Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data raport" });
  }
};
