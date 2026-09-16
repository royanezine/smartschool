import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";

export const getDashboardSekolah = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const yayasanId = req.user?.yayasanId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      absensiHariIni,
    ] = await Promise.all([
      prisma.pengguna.count({
        where: {
          sekolahId,
          peran: {
            nama: "siswa",
          },
          dihapusPada: null,
          status: "aktif",
        },
      }),
      prisma.pengguna.count({
        where: {
          sekolahId,
          peran: {
            nama: "guru",
          },
          dihapusPada: null,
          status: "aktif",
        },
      }),
      prisma.kelas.count({
        where: {
          sekolahId,
          dihapusPada: null,
        },
      }),
      prisma.absensi.groupBy({
        by: ["status"],
        where: {
          kelas: {
            sekolahId,
          },
          tanggal: new Date(),
        },
        _count: true,
      }),
    ]);

    const rekapKehadiran = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    };

    absensiHariIni.forEach((absensi) => {
      const status = absensi.status.toLowerCase();

      if (status === "h") {
        rekapKehadiran.hadir = absensi._count;
      } else if (status === "i") {
        rekapKehadiran.izin = absensi._count;
      } else if (status === "s") {
        rekapKehadiran.sakit = absensi._count;
      } else if (status === "a") {
        rekapKehadiran.alpha = absensi._count;
      }
    });

    const persentaseHadir =
      totalSiswa > 0
        ? ((rekapKehadiran.hadir / totalSiswa) * 100).toFixed(1)
        : "0";

    let yayasan = null;

    if (yayasanId) {
      const [yayasanSiswa, yayasanGuru, yayasanKelas] =
        await Promise.all([
          prisma.pengguna.count({
            where: {
              yayasanId,
              peran: {
                nama: "siswa",
              },
              dihapusPada: null,
              status: "aktif",
            },
          }),
          prisma.pengguna.count({
            where: {
              yayasanId,
              peran: {
                nama: "guru",
              },
              dihapusPada: null,
              status: "aktif",
            },
          }),
          prisma.kelas.count({
            where: {
              sekolah: {
                yayasanId,
              },
              dihapusPada: null,
            },
          }),
        ]);

      yayasan = {
        totalSiswa: yayasanSiswa,
        totalGuru: yayasanGuru,
        totalKelas: yayasanKelas,
      };
    }

    return successResponse(
      res,
      "Berhasil mengambil statistik dashboard",
      {
        cabang: {
          totalSiswa,
          totalGuru,
          totalKelas,
          persentaseHadir: `${persentaseHadir}%`,
          rekapKehadiran,
        },
        yayasan,
      }
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};