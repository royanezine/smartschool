import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";
import { normalizeRole } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";
import { attendanceSchoolFilter } from "../services/absensiQuery.service";
import { todayDateOnly } from "../utils/dateOnly";

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
          : actorRole === "super_admin" ? {} : null;

    const today = todayDateOnly();
    const schoolIds = isAdminYayasan && yayasanId
      ? (await prisma.sekolah.findMany({ where: { yayasanId, dihapusPada: null }, select: { id: true } })).map(s => s.id)
      : sekolahId ? [sekolahId] : actorRole === "super_admin" ? (await prisma.sekolah.findMany({ where: { dihapusPada: null }, select: { id: true } })).map(s => s.id) : [];

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
                OR: schoolIds.map(id => attendanceSchoolFilter(id)),
                tanggal: today,
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

      if (["h", "hadir", "terlambat"].includes(status)) {
        rekapKehadiran.hadir += absensi._count;
      } else if (["i", "izin"].includes(status)) {
        rekapKehadiran.izin += absensi._count;
      } else if (["s", "sakit"].includes(status)) {
        rekapKehadiran.sakit += absensi._count;
      } else if (["a", "alpha", "alpa"].includes(status)) {
        rekapKehadiran.alpha += absensi._count;
      }
    });

    const persentaseHadir =
      totalSiswa + totalGuru > 0
        ? Math.min(100, (rekapKehadiran.hadir / (totalSiswa + totalGuru)) * 100).toFixed(1)
        : "0";

    const yayasan = isAdminYayasan
      ? { totalSekolah, totalSiswa, totalGuru, totalKelas }
      : null;

    const daftarSekolah = isAdminYayasan ? await prisma.sekolah.findMany({ where: { id: { in: schoolIds } }, select: { id: true, nama: true } }) : [];
    const [siswaPerSekolah, guruPerSekolah, kelasPerSekolah] = isAdminYayasan ? await Promise.all([
      prisma.pengguna.groupBy({ by: ["sekolahId"], where: { sekolahId: { in: schoolIds }, dihapusPada: null, status: "aktif", peran: { nama: "siswa" } }, _count: true }),
      prisma.pengguna.groupBy({ by: ["sekolahId"], where: { sekolahId: { in: schoolIds }, dihapusPada: null, status: "aktif", peran: { nama: "guru" } }, _count: true }),
      prisma.kelas.groupBy({ by: ["sekolahId"], where: { sekolahId: { in: schoolIds }, dihapusPada: null }, _count: true }),
    ]) : [[], [], []];

    return successResponse(res, "Berhasil mengambil statistik dashboard", {
      scope: isAdminYayasan ? "yayasan" : sekolahId ? "sekolah" : "platform",
      platform: actorRole === "super_admin" && !sekolahId ? { totalSekolah: schoolIds.length, totalSiswa, totalGuru, totalKelas } : null,
      sekolah: !isAdminYayasan && sekolahId ? { id: sekolahId, totalSiswa, totalGuru, totalKelas, persentaseHadir: `${persentaseHadir}%`, rekapKehadiran } : null,
      cabang: {
        totalSiswa,
        totalGuru,
        totalKelas,
        persentaseHadir: `${persentaseHadir}%`,
        rekapKehadiran,
      },
      yayasan: yayasan ? { id: yayasanId, ...yayasan, persentaseHadir: `${persentaseHadir}%`, rekapKehadiran,
        sekolah: daftarSekolah.map(s => ({ ...s, totalSiswa: siswaPerSekolah.find(g => g.sekolahId === s.id)?._count ?? 0, totalGuru: guruPerSekolah.find(g => g.sekolahId === s.id)?._count ?? 0, totalKelas: kelasPerSekolah.find(g => g.sekolahId === s.id)?._count ?? 0 })),
      } : null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
