import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const jenisKehadiran = (status: string) => {
  const v = status.toLowerCase();
  if (["h", "hadir", "terlambat"].includes(v)) return "hadir";
  if (["i", "izin"].includes(v)) return "izin";
  if (["s", "sakit"].includes(v)) return "sakit";
  if (["a", "alpha", "alpa"].includes(v)) return "alpha";
  return null;
};

export const getDashboardSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId as string | undefined;
    const sekolahId = req.user?.sekolahId as string | undefined;
    if (!userId || !sekolahId) {
      throw new AppError("Akun tidak terhubung dengan sekolah", 403);
    }

    const sekarang = new Date();
    const awalBulan = new Date(
      Date.UTC(sekarang.getFullYear(), sekarang.getMonth(), 1),
    );
    const akhirBulan = new Date(
      Date.UTC(sekarang.getFullYear(), sekarang.getMonth() + 1, 0),
    );
    const hari = NAMA_HARI[sekarang.getDay()]!;

    const [siswa, anggota] = await Promise.all([
      prisma.pengguna.findFirst({
        where: { id: userId, dihapusPada: null },
        select: {
          id: true,
          namaLengkap: true,
          email: true,
          avatar: true,
          nis: true,
          nisn: true,
        },
      }),
      prisma.anggotaKelas.findFirst({
        where: { penggunaId: userId, dihapusPada: null },
        orderBy: [
          { kelas: { tahunAjaran: { status: "asc" } } },
          { dibuatPada: "desc" },
        ],
        select: {
          kelasId: true,
          kelas: {
            select: {
              nama: true,
              tingkat: true,
              shift: true,
              waliKelas: { select: { namaLengkap: true } },
              tahunAjaran: {
                select: { tahunAjaran: true, semester: true, status: true },
              },
            },
          },
        },
      }),
    ]);
    if (!siswa) throw new AppError("Siswa tidak ditemukan", 404);

    const kelasId = anggota?.kelasId ?? "-";

    const [
      absensi,
      tugas,
      nilaiTerbaru,
      jadwal,
      tagihanAgg,
      tagihanTerdekat,
      tabungan,
      notifikasiBelumDibaca,
      pelanggaranAgg,
      rataNilai,
    ] = await Promise.all([
      prisma.absensi.groupBy({
        by: ["status"],
        where: {
          penggunaId: userId,
          tanggal: { gte: awalBulan, lte: akhirBulan },
        },
        _count: true,
      }),
      prisma.tugas.findMany({
        where: {
          dihapusPada: null,
          batasWaktu: { gte: sekarang },
          kelasMapel: { kelasId: kelasId },
          pengumpulanTugasSiswa: { none: { penggunaId: userId } },
        },
        orderBy: { batasWaktu: "asc" },
        take: 5,
        select: {
          id: true,
          judul: true,
          batasWaktu: true,
          kelasMapel: {
            select: { mataPelajaran: { select: { nama: true } } },
          },
        },
      }),
      prisma.nilai.findMany({
        where: { penggunaId: userId },
        orderBy: { dibuatPada: "desc" },
        take: 5,
        select: {
          id: true,
          nilai: true,
          dibuatPada: true,
          komponenNilai: { select: { nama: true, jenis: true } },
          kelasMapel: {
            select: { mataPelajaran: { select: { nama: true } } },
          },
        },
      }),
      prisma.jadwalMengajar.findMany({
        where: {
          dihapusPada: null,
          hari: { equals: hari, mode: "insensitive" },
          kelasMapel: { kelasId: kelasId },
        },
        orderBy: { jamMulai: "asc" },
        select: {
          id: true,
          jamMulai: true,
          jamSelesai: true,
          ruangan: true,
          kelasMapel: {
            select: {
              mataPelajaran: { select: { nama: true } },
              guruPengajar: { select: { namaLengkap: true } },
            },
          },
        },
      }),
      prisma.tagihan.aggregate({
        where: { siswaId: userId, dihapusPada: null, sisa: { gt: 0 } },
        _sum: { sisa: true },
        _count: { _all: true },
      }),
      prisma.tagihan.findFirst({
        where: { siswaId: userId, dihapusPada: null, sisa: { gt: 0 } },
        orderBy: { jatuhTempo: "asc" },
        select: {
          nomorTagihan: true,
          jatuhTempo: true,
          sisa: true,
          kategoriTagihan: { select: { nama: true } },
        },
      }),
      prisma.tabunganSiswa.findFirst({
        where: { siswaId: userId, sekolahId, dihapusPada: null },
        select: { saldo: true },
      }),
      prisma.notifikasi.count({ where: { penggunaId: userId, dibaca: false } }),
      prisma.pelanggaranSiswa.aggregate({
        where: { siswaId: userId, dihapusPada: null },
        _sum: { poin: true },
        _count: { _all: true },
      }),
      prisma.nilaiAkhirMapel.aggregate({
        where: { penggunaId: userId, dihapusPada: null },
        _avg: { nilaiAkhir: true },
      }),
    ]);

    const rekap = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    absensi.forEach((a) => {
      const jenis = jenisKehadiran(a.status);
      if (jenis) rekap[jenis] += a._count;
    });
    const totalAbsen = rekap.hadir + rekap.izin + rekap.sakit + rekap.alpha;

    return successResponse(res, "Berhasil mengambil dashboard siswa", {
      profil: {
        id: siswa.id,
        namaLengkap: siswa.namaLengkap,
        email: siswa.email,
        avatar: siswa.avatar,
        nis: siswa.nis,
        nisn: siswa.nisn,
      },
      kelas: anggota
        ? {
            id: anggota.kelasId,
            nama: anggota.kelas.nama,
            tingkat: anggota.kelas.tingkat,
            shift: anggota.kelas.shift,
            waliKelas: anggota.kelas.waliKelas?.namaLengkap ?? null,
            tahunAjaran: anggota.kelas.tahunAjaran,
          }
        : null,
      kehadiranBulanIni: {
        ...rekap,
        total: totalAbsen,
        persentase:
          totalAbsen > 0
            ? Math.round((rekap.hadir / totalAbsen) * 1000) / 10
            : 0,
      },
      jadwalHariIni: jadwal.map((j) => ({
        id: j.id,
        hari,
        jamMulai: j.jamMulai,
        jamSelesai: j.jamSelesai,
        ruangan: j.ruangan,
        mataPelajaran: j.kelasMapel.mataPelajaran.nama,
        guru: j.kelasMapel.guruPengajar.namaLengkap,
      })),
      tugasMendatang: tugas.map((t) => ({
        id: t.id,
        judul: t.judul,
        batasWaktu: t.batasWaktu,
        mataPelajaran: t.kelasMapel.mataPelajaran.nama,
      })),
      nilaiTerbaru: nilaiTerbaru.map((n) => ({
        id: n.id,
        nilai: Number(n.nilai),
        komponen: n.komponenNilai.nama,
        jenis: n.komponenNilai.jenis,
        mataPelajaran: n.kelasMapel.mataPelajaran.nama,
        tanggal: n.dibuatPada,
      })),
      rataRataNilai:
        rataNilai._avg.nilaiAkhir === null
          ? 0
          : Math.round(Number(rataNilai._avg.nilaiAkhir) * 10) / 10,
      tagihan: {
        jumlahBelumLunas: tagihanAgg._count._all,
        totalSisa: Number(tagihanAgg._sum.sisa ?? 0),
        terdekat: tagihanTerdekat
          ? {
              nomorTagihan: tagihanTerdekat.nomorTagihan,
              kategori: tagihanTerdekat.kategoriTagihan.nama,
              jatuhTempo: tagihanTerdekat.jatuhTempo,
              sisa: Number(tagihanTerdekat.sisa),
            }
          : null,
      },
      tabungan: { saldo: Number(tabungan?.saldo ?? 0) },
      pelanggaran: {
        jumlah: pelanggaranAgg._count._all,
        totalPoin: pelanggaranAgg._sum.poin ?? 0,
      },
      notifikasiBelumDibaca,
    });
  } catch (error) {
    next(error);
  }
};