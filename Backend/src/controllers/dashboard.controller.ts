import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";
import { normalizeRole } from "../utils/rbac";

export const getDashboardSekolah = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const actorRole = normalizeRole(req.user?.role);
    const sekolahId =
      req.user?.sekolahId ||
      (actorRole === "super_admin" ? (req.query.sekolahId as string | undefined) : undefined);
    const yayasanId = req.user?.yayasanId;

    if (!sekolahId && actorRole !== "super_admin" && !yayasanId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      absensiHariIni,
    ] = await Promise.all([
      sekolahId
        ? prisma.pengguna.count({
            where: {
              sekolahId,
              peran: {
                nama: "siswa",
              },
              dihapusPada: null,
              status: "aktif",
            },
          })
        : 0,
      sekolahId
        ? prisma.pengguna.count({
            where: {
              sekolahId,
              peran: {
                nama: "guru",
              },
              dihapusPada: null,
              status: "aktif",
            },
          })
        : 0,
      sekolahId
        ? prisma.kelas.count({
            where: {
              sekolahId,
              dihapusPada: null,
            },
          })
        : 0,
      sekolahId
        ? prisma.absensi.groupBy({
            by: ["status"],
            where: {
              kelas: {
                sekolahId,
              },
              tanggal: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            _count: true,
          })
        : [],
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