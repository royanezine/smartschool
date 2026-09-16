import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { successResponse } from "../utils/responseFormatter";

// 1. Mengambil Daftar Sekolah Binaan (Sudah ada, dipertahankan)
export const getSekolahBinaan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const sekolah = await prisma.sekolah.findMany({
      where: { yayasanId: req.user.yayasanId, dihapusPada: null },
      select: {
        id: true,
        nama: true,
        subdomain: true,
        status: true,
        telepon: true,
        email: true,
        logoBesarUrl: true,
        langgananSekolah: {
          orderBy: { dibuatPada: 'desc' },
          take: 1,
          select: { statusLangganan: true, tanggalBerakhir: true, paket: { select: { nama: true } } }
        }
      },
      orderBy: { dibuatPada: 'desc' }
    });

    return successResponse(res, "Berhasil mengambil data sekolah binaan", sekolah);
  } catch (error) {
    console.error("Error getSekolahBinaan:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// 2. Metrik Dashboard (Total Sekolah, Status Aktif, dll)
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const yayasanId = req.user.yayasanId;

    const totalSekolah = await prisma.sekolah.count({ where: { yayasanId, dihapusPada: null } });
    const sekolahAktif = await prisma.sekolah.count({ where: { yayasanId, status: "aktif", dihapusPada: null } });
    const sekolahUjiCoba = await prisma.sekolah.count({ where: { yayasanId, status: "uji coba", dihapusPada: null } });

    // Hitung total pengguna (Siswa & Guru) di bawah yayasan ini
    const totalPengguna = await prisma.pengguna.count({
      where: {
        sekolah: { yayasanId },
        peran: { nama: { in: ["siswa", "guru"] } },
        dihapusPada: null
      }
    });

    const data = {
      totalSekolah,
      sekolahAktif,
      sekolahUjiCoba,
      totalPenggunaAktif: totalPengguna
    };

    return successResponse(res, "Berhasil mengambil metrik dashboard yayasan", data);
  } catch (error) {
    console.error("Error getDashboardSummary:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// 3. Melihat Detail Statistik Satu Sekolah (Read-Only)
export const getDetailSekolahBinaan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.yayasanId) {
      return res.status(403).json({ success: false, message: "Akses ditolak: Khusus Admin Yayasan" });
    }

    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ success: false, message: "ID sekolah tidak valid" });
    }

    // Pastikan sekolah ini benar-benar milik yayasan tersebut
    const sekolah = await prisma.sekolah.findFirst({
      where: { id, yayasanId: req.user.yayasanId, dihapusPada: null },
      include: {
        langgananSekolah: {
          orderBy: { dibuatPada: 'desc' },
          take: 1,
          include: { paket: true }
        }
      }
    });

    if (!sekolah) {
      return res.status(404).json({ success: false, message: "Sekolah tidak ditemukan atau tidak berada di bawah naungan Anda" });
    }

    // Ambil statistik jumlah guru dan siswa di sekolah tersebut
    const totalGuru = await prisma.pengguna.count({
      where: { sekolahId: id, peran: { nama: "guru" }, dihapusPada: null }
    });
    const totalSiswa = await prisma.pengguna.count({
      where: { sekolahId: id, peran: { nama: "siswa" }, dihapusPada: null }
    });
    const totalKelas = await prisma.kelas.count({
      where: { sekolahId: id, dihapusPada: null }
    });

    const data = {
      profil: sekolah,
      statistik: { totalGuru, totalSiswa, totalKelas }
    };

    return successResponse(res, "Berhasil mengambil detail sekolah", data);
  } catch (error) {
    console.error("Error getDetailSekolahBinaan:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
