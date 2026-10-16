import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";
import { normalizeRole } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";

export const getDashboardSekolah = async (req: AuthRequest, res: Response) => {
  try {
    const actorRole = normalizeRole(req.user?.role);
    const isAdminYayasan = actorRole === "admin_yayasan";
    const yayasanId = req.user?.yayasanId;
    const sekolahId =
      req.user?.sekolahId ||
      (actorRole === "super_admin"
        ? (req.query.sekolahId as string | undefined)
        : undefined);

    if (isAdminYayasan) {
      if (!yayasanId) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Akun tidak terhubung dengan yayasan manapun",
          errorCode: "NO_TENANT_LINKED",
        });
      }

      const { aktif } = await cekLanggananYayasan(yayasanId);
      if (!aktif) {
        return res.status(403).json({
          success: false,
          message: "Langganan yayasan tidak aktif atau telah berakhir",
          errorCode: "YAYASAN_SUBSCRIPTION_INACTIVE",
        });
      }
    } else if (!sekolahId && actorRole !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const scope =
      isAdminYayasan && yayasanId
        ? { sekolah: { yayasanId, dihapusPada: null } }
        : sekolahId
          ? { sekolahId }
          : null;

    const today = new Date();
    const startOfDay = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const endOfDay = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const [totalSiswa, totalGuru, totalKelas, absensiHariIni, totalSekolah] =
      await Promise.all([
        scope
          ? prisma.pengguna.count({
              where: {
                ...scope,
                peran: { nama: "siswa" },
                dihapusPada: null,
                status: "aktif",
              },
            })
          : 0,
        scope
          ? prisma.pengguna.count({
              where: {
                ...scope,
                peran: { nama: "guru" },
                dihapusPada: null,
                status: "aktif",
              },
            })
          : 0,
        scope
          ? prisma.kelas.count({
              where: { ...scope, dihapusPada: null },
            })
          : 0,
        scope
          ? prisma.absensi.groupBy({
              by: ["status"],
              where: {
                kelas: scope,
                tanggal: { gte: startOfDay, lte: endOfDay },
              },
              _count: true,
            })
          : [],
        isAdminYayasan && yayasanId
          ? prisma.sekolah.count({ where: { yayasanId, dihapusPada: null } })
          : 0,
      ]);

    const rekapKehadiran = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

    absensiHariIni.forEach((absensi) => {
      const status = absensi.status.toLowerCase();

      if (status === "h") {
        rekapKehadiran.hadir += absensi._count;
      } else if (status === "i") {
        rekapKehadiran.izin += absensi._count;
      } else if (status === "s") {
        rekapKehadiran.sakit += absensi._count;
      } else if (status === "a") {
        rekapKehadiran.alpha += absensi._count;
      }
    });

    const persentaseHadir =
      totalSiswa > 0
        ? ((rekapKehadiran.hadir / totalSiswa) * 100).toFixed(1)
        : "0";

    const yayasan = isAdminYayasan
      ? { totalSekolah, totalSiswa, totalGuru, totalKelas }
      : null;

    return successResponse(res, "Berhasil mengambil statistik dashboard", {
      cabang: {
        totalSiswa,
        totalGuru,
        totalKelas,
        persentaseHadir: `${persentaseHadir}%`,
        rekapKehadiran,
      },
      yayasan,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};