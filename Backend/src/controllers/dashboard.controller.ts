import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { successResponse } from "../utils/responseFormatter";
import { normalizeRole } from "../utils/rbac";
import { cekLanggananYayasan } from "../utils/yayasanLangganan";
import { attendanceSchoolFilter } from "../services/absensiQuery.service";
import { todayDateOnly } from "../utils/dateOnly";

const rekapHariIni = async (schoolIds: string[]) => {
  const rekap = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
  if (schoolIds.length === 0) return rekap;
  const rows = await prisma.absensi.groupBy({
    by: ["status"],
    where: {
      OR: schoolIds.map((id) => attendanceSchoolFilter(id)),
      tanggal: todayDateOnly(),
    },
    _count: true,
  });
  rows.forEach((row) => {
    const status = row.status.toLowerCase();
    if (["h", "hadir", "terlambat"].includes(status)) rekap.hadir += row._count;
    else if (["i", "izin"].includes(status)) rekap.izin += row._count;
    else if (["s", "sakit"].includes(status)) rekap.sakit += row._count;
    else if (["a", "alpha", "alpa"].includes(status)) rekap.alpha += row._count;
  });
  return rekap;
};

const hitungPerSekolah = async (schoolIds: string[]) => {
  if (schoolIds.length === 0) {
    return { siswa: [], guru: [], kelas: [] };
  }
  const dasar = {
    sekolahId: { in: schoolIds },
    dihapusPada: null,
    status: "aktif",
  };
  const [siswa, guru, kelas] = await Promise.all([
    prisma.pengguna.groupBy({
      by: ["sekolahId"],
      where: { ...dasar, peran: { nama: "siswa" } },
      _count: true,
    }),
    prisma.pengguna.groupBy({
      by: ["sekolahId"],
      where: { ...dasar, peran: { nama: "guru" } },
      _count: true,
    }),
    prisma.kelas.groupBy({
      by: ["sekolahId"],
      where: { sekolahId: { in: schoolIds }, dihapusPada: null },
      _count: true,
    }),
  ]);
  return { siswa, guru, kelas };
};

const persentase = (hadir: number, totalOrang: number) =>
  totalOrang > 0
    ? `${Math.min(100, (hadir / totalOrang) * 100).toFixed(1)}%`
    : "0%";

const kunciBulan = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const buatLabelEnamBulan = () => {
  const awal = new Date();
  awal.setDate(1);
  awal.setHours(0, 0, 0, 0);
  awal.setMonth(awal.getMonth() - 5);
  const label = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(awal);
    d.setMonth(awal.getMonth() + i);
    return kunciBulan(d);
  });
  return { awal, label };
};

export const getDashboardSekolah = async (req: AuthRequest, res: Response) => {
  try {
    const actorRole = normalizeRole(req.user?.role);
    const isSuperAdmin = actorRole === "super_admin";
    const isAdminYayasan = actorRole === "admin_yayasan";
    const yayasanId = req.user?.yayasanId;
    const sekolahId =
      req.user?.sekolahId ||
      (isSuperAdmin ? (req.query.sekolahId as string | undefined) : undefined);

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

      const daftarSekolah = await prisma.sekolah.findMany({
        where: { yayasanId, dihapusPada: null },
        select: { id: true, nama: true, jenjang: true, status: true },
        orderBy: { nama: "asc" },
      });
      const schoolIds = daftarSekolah.map((s) => s.id);
      const [profil, perSekolah, rekap] = await Promise.all([
        prisma.yayasan.findUnique({
          where: { id: yayasanId },
          select: {
            id: true,
            nama: true,
            npyp: true,
            statusLangganan: true,
            tanggalMulaiLangganan: true,
            tanggalBerakhirLangganan: true,
            paket: { select: { id: true, nama: true } },
          },
        }),
        hitungPerSekolah(schoolIds),
        rekapHariIni(schoolIds),
      ]);

      const daftar = daftarSekolah.map((s) => ({
        ...s,
        totalSiswa: perSekolah.siswa.find((g) => g.sekolahId === s.id)?._count ?? 0,
        totalGuru: perSekolah.guru.find((g) => g.sekolahId === s.id)?._count ?? 0,
        totalKelas: perSekolah.kelas.find((g) => g.sekolahId === s.id)?._count ?? 0,
      }));
      const totalSiswa = daftar.reduce((a, s) => a + s.totalSiswa, 0);
      const totalGuru = daftar.reduce((a, s) => a + s.totalGuru, 0);
      const totalKelas = daftar.reduce((a, s) => a + s.totalKelas, 0);
      const persentaseHadir = persentase(rekap.hadir, totalSiswa + totalGuru);

      return successResponse(res, "Berhasil mengambil statistik dashboard", {
        scope: "yayasan",
        platform: null,
        sekolah: null,
        cabang: {
          totalSiswa,
          totalGuru,
          totalKelas,
          persentaseHadir,
          rekapKehadiran: rekap,
        },
        yayasan: {
          id: yayasanId,
          nama: profil?.nama ?? null,
          npyp: profil?.npyp ?? null,
          langganan: {
            paket: profil?.paket ?? null,
            statusLangganan: profil?.statusLangganan ?? null,
            tanggalMulai: profil?.tanggalMulaiLangganan ?? null,
            tanggalBerakhir: profil?.tanggalBerakhirLangganan ?? null,
          },
          totalSekolah: daftar.length,
          totalSiswa,
          totalGuru,
          totalKelas,
          persentaseHadir,
          rekapKehadiran: rekap,
          sekolah: daftar,
        },
      });
    }

    if (sekolahId) {
      const [profil, perSekolah, rekap] = await Promise.all([
        prisma.sekolah.findFirst({
          where: { id: sekolahId, dihapusPada: null },
          select: { id: true, nama: true, jenjang: true, status: true },
        }),
        hitungPerSekolah([sekolahId]),
        rekapHariIni([sekolahId]),
      ]);
      const totalSiswa = perSekolah.siswa[0]?._count ?? 0;
      const totalGuru = perSekolah.guru[0]?._count ?? 0;
      const totalKelas = perSekolah.kelas[0]?._count ?? 0;
      const persentaseHadir = persentase(rekap.hadir, totalSiswa + totalGuru);

      return successResponse(res, "Berhasil mengambil statistik dashboard", {
        scope: "sekolah",
        platform: null,
        yayasan: null,
        cabang: {
          totalSiswa,
          totalGuru,
          totalKelas,
          persentaseHadir,
          rekapKehadiran: rekap,
        },
        sekolah: {
          id: sekolahId,
          nama: profil?.nama ?? null,
          jenjang: profil?.jenjang ?? null,
          status: profil?.status ?? null,
          totalSiswa,
          totalGuru,
          totalKelas,
          persentaseHadir,
          rekapKehadiran: rekap,
        },
      });
    }

    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
        errorCode: "NO_TENANT_LINKED",
      });
    }

    const { awal, label } = buatLabelEnamBulan();
    const sekolahAktifWhere = { dihapusPada: null };
    const [
      totalSekolah,
      sekolahAktif,
      sekolahUjiCoba,
      totalSiswa,
      totalGuru,
      totalKelas,
      pendapatanTotal,
      sekolahBaru,
      langgananBaru,
    ] = await Promise.all([
      prisma.sekolah.count({ where: sekolahAktifWhere }),
      prisma.sekolah.count({ where: { ...sekolahAktifWhere, status: "aktif" } }),
      prisma.sekolah.count({ where: { ...sekolahAktifWhere, status: "uji coba" } }),
      prisma.pengguna.count({
        where: {
          sekolahId: { not: null },
          peran: { nama: "siswa" },
          status: "aktif",
          dihapusPada: null,
        },
      }),
      prisma.pengguna.count({
        where: {
          sekolahId: { not: null },
          peran: { nama: "guru" },
          status: "aktif",
          dihapusPada: null,
        },
      }),
      prisma.kelas.count({ where: { dihapusPada: null } }),
      prisma.langgananSekolah.aggregate({
        where: { statusPembayaran: "success" },
        _sum: { hargaSaatBerlangganan: true },
      }),
      prisma.sekolah.findMany({
        where: { ...sekolahAktifWhere, dibuatPada: { gte: awal } },
        select: { dibuatPada: true },
      }),
      prisma.langgananSekolah.findMany({
        where: { statusPembayaran: "success", dibuatPada: { gte: awal } },
        select: { dibuatPada: true, hargaSaatBerlangganan: true },
      }),
    ]);

    const tenantBaruPerBulan = label.map((bulan) => ({
      bulan,
      jumlah: sekolahBaru.filter((s) => kunciBulan(s.dibuatPada) === bulan).length,
    }));
    const pendapatanPerBulan = label.map((bulan) => ({
      bulan,
      jumlah: langgananBaru
        .filter((l) => kunciBulan(l.dibuatPada) === bulan)
        .reduce((a, l) => a + Number(l.hargaSaatBerlangganan ?? 0), 0),
    }));

    const emptyRekap = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };

    return successResponse(res, "Berhasil mengambil statistik dashboard", {
      scope: "platform",
      yayasan: null,
      sekolah: null,
      cabang: {
        totalSiswa,
        totalGuru,
        totalKelas,
        persentaseHadir: "0%",
        rekapKehadiran: emptyRekap,
      },
      platform: {
        totalSekolah,
        sekolahAktif,
        sekolahUjiCoba,
        totalSiswa,
        totalGuru,
        totalKelas,
        totalPendapatan: Number(pendapatanTotal._sum.hargaSaatBerlangganan ?? 0),
        grafik: { tenantBaruPerBulan, pendapatanPerBulan },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};