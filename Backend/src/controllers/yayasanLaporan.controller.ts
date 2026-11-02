import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { attendanceSchoolFilter } from "../services/absensiQuery.service";

type SekolahRingkas = {
  id: string;
  nama: string;
  jenjang: string | null;
  alamat: string | null;
};

type Konteks = { ids: string[]; sekolah: SekolahRingkas[] };

type BarisNilai = {
  sekolah_id: string;
  rata: number | null;
  total: number;
  tuntas: number;
  tertinggi: number | null;
  terendah: number | null;
  siswa_di_bawah: number;
};

const ambilKonteks = async (req: AuthRequest): Promise<Konteks> => {
  const yayasanId = req.user?.yayasanId;
  if (!yayasanId) {
    throw new AppError("Akun tidak terhubung dengan yayasan", 403);
  }
  const sekolah = await prisma.sekolah.findMany({
    where: { yayasanId, dihapusPada: null },
    select: { id: true, nama: true, jenjang: true, alamat: true },
    orderBy: { nama: "asc" },
  });
  return { sekolah, ids: sekolah.map((s) => s.id) };
};

const angka = (v: unknown) =>
  v === null || v === undefined ? 0 : Number(v);
const bulat = (v: number) => Math.round(v * 10) / 10;
const persen = (a: number, b: number) => (b > 0 ? bulat((a / b) * 100) : 0);
const jumlah = (nilai: number[]) => nilai.reduce((a, b) => a + b, 0);

const jenisKehadiran = (status: string) => {
  const v = status.toLowerCase();
  if (["h", "hadir", "terlambat"].includes(v)) return "hadir";
  if (["i", "izin"].includes(v)) return "izin";
  if (["s", "sakit"].includes(v)) return "sakit";
  if (["a", "alpha", "alpa"].includes(v)) return "alpha";
  return null;
};

const apakahLaki = (v: string | null) => {
  const s = (v ?? "").trim().toLowerCase();
  return s === "l" || s.startsWith("laki");
};

const apakahPerempuan = (v: string | null) => {
  const s = (v ?? "").trim().toLowerCase();
  return s === "p" || s.startsWith("perempuan");
};

const kelompok = async (query: Prisma.Sql) => {
  const rows = await prisma.$queryRaw<{ sekolah_id: string; jumlah: number }[]>(
    query,
  );
  return new Map(rows.map((r) => [r.sekolah_id, Number(r.jumlah)]));
};

const hitungSiswa = async (ids: string[]) => {
  const peta = new Map<
    string,
    { lakiLaki: number; perempuan: number; total: number }
  >();
  if (ids.length === 0) return peta;
  const rows = await prisma.pengguna.groupBy({
    by: ["sekolahId", "jenisKelamin"],
    where: {
      sekolahId: { in: ids },
      peran: { nama: "siswa" },
      status: "aktif",
      dihapusPada: null,
    },
    _count: { _all: true },
  });
  rows.forEach((r) => {
    if (!r.sekolahId) return;
    const item = peta.get(r.sekolahId) ?? {
      lakiLaki: 0,
      perempuan: 0,
      total: 0,
    };
    const n = r._count._all;
    item.total += n;
    if (apakahLaki(r.jenisKelamin)) item.lakiLaki += n;
    else if (apakahPerempuan(r.jenisKelamin)) item.perempuan += n;
    peta.set(r.sekolahId, item);
  });
  return peta;
};

const rekapAbsensi = async (sekolahId: string) => {
  const rows = await prisma.absensi.groupBy({
    by: ["status"],
    where: {
      AND: [
        attendanceSchoolFilter(sekolahId),
        { pengguna: { peran: { nama: "siswa" } } },
      ],
    },
    _count: true,
  });
  const rekap = { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 };
  rows.forEach((r) => {
    const jenis = jenisKehadiran(r.status);
    if (!jenis) return;
    rekap[jenis] += r._count;
    rekap.total += r._count;
  });
  return rekap;
};

const statistikNilai = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, BarisNilai>();
  const rows = await prisma.$queryRaw<BarisNilai[]>(Prisma.sql`
    SELECT
      sekolah_id,
      AVG(nilai_akhir)::float8 AS rata,
      COUNT(*)::int AS total,
      SUM(CASE WHEN nilai_akhir >= kkm THEN 1 ELSE 0 END)::int AS tuntas,
      MAX(nilai_akhir)::float8 AS tertinggi,
      MIN(nilai_akhir)::float8 AS terendah,
      COUNT(DISTINCT CASE WHEN nilai_akhir < kkm THEN pengguna_id END)::int AS siswa_di_bawah
    FROM nilai_akhir_mapel
    WHERE dihapus_pada IS NULL
      AND sekolah_id IN (${Prisma.join(ids)})
    GROUP BY sekolah_id
  `);
  return new Map(rows.map((r) => [r.sekolah_id, r]));
};

const bungkus =
  (fn: (req: AuthRequest, res: Response) => Promise<unknown>) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

export const laporanSiswa = bungkus(async (req, res) => {
  const { sekolah, ids } = await ambilKonteks(req);
  const peta = await hitungSiswa(ids);
  const perSekolah = sekolah.map((s) => {
    const d = peta.get(s.id) ?? { lakiLaki: 0, perempuan: 0, total: 0 };
    return {
      sekolahId: s.id,
      namaSekolah: s.nama,
      jenjang: s.jenjang,
      alamat: s.alamat,
      lakiLaki: d.lakiLaki,
      perempuan: d.perempuan,
      total: d.total,
    };
  });
  return successResponse(res, "Berhasil mengambil laporan data siswa", {
    ringkasan: {
      totalSiswa: jumlah(perSekolah.map((p) => p.total)),
      totalUnit: sekolah.length,
      totalLakiLaki: jumlah(perSekolah.map((p) => p.lakiLaki)),
      totalPerempuan: jumlah(perSekolah.map((p) => p.perempuan)),
    },
    perSekolah,
  });
});

export const laporanAkademik = bungkus(async (req, res) => {
  const { sekolah, ids } = await ambilKonteks(req);
  const [nilai, siswa, kehadiran] = await Promise.all([
    statistikNilai(ids),
    hitungSiswa(ids),
    Promise.all(ids.map((id) => rekapAbsensi(id))),
  ]);
  const perSekolah = sekolah.map((s, i) => {
    const n = nilai.get(s.id);
    const h = kehadiran[i]!;
    return {
      sekolahId: s.id,
      namaSekolah: s.nama,
      jenjang: s.jenjang,
      siswa: siswa.get(s.id)?.total ?? 0,
      rataNilai: bulat(angka(n?.rata)),
      kehadiran: persen(h.hadir, h.total),
      tuntasKKM: persen(angka(n?.tuntas), angka(n?.total)),
    };
  });
  const totalNilai = jumlah([...nilai.values()].map((n) => n.total));
  const totalTuntas = jumlah([...nilai.values()].map((n) => n.tuntas));
  const bobotRata = jumlah(
    [...nilai.values()].map((n) => angka(n.rata) * n.total),
  );
  const totalHadir = jumlah(kehadiran.map((h) => h.hadir));
  const totalAbsen = jumlah(kehadiran.map((h) => h.total));
  return successResponse(res, "Berhasil mengambil laporan akademik", {
    ringkasan: {
      rataNilaiGlobal: totalNilai > 0 ? bulat(bobotRata / totalNilai) : 0,
      rataKehadiranGlobal: persen(totalHadir, totalAbsen),
      totalSiswa: jumlah(perSekolah.map((p) => p.siswa)),
      tuntasKKM: persen(totalTuntas, totalNilai),
    },
    perSekolah,
  });
});

export const laporanInventaris = bungkus(async (req, res) => {
  const { ids } = await ambilKonteks(req);
  const page = Math.max(parseInt(String(req.query.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit ?? "100"), 10) || 100, 1),
    500,
  );
  if (ids.length === 0) {
    return successResponse(res, "Berhasil mengambil data inventaris", {
      ringkasan: {
        totalUnitBarang: 0,
        totalNilaiAset: 0,
        kondisiBaik: 0,
        perluPerhatian: 0,
      },
      daftarBarang: [],
      pagination: { page, limit, total: 0, totalPages: 1 },
    });
  }
  const where: Prisma.AsetWhereInput = {
    sekolahId: { in: ids },
    dihapusPada: null,
  };
  const [totalBaris, totalUnit, unitBaik, nilaiRows, daftar] =
    await Promise.all([
      prisma.aset.count({ where }),
      prisma.aset.aggregate({ where, _sum: { jumlah: true } }),
      prisma.aset.aggregate({
        where: { ...where, kondisi: { equals: "baik", mode: "insensitive" } },
        _sum: { jumlah: true },
      }),
      prisma.$queryRaw<{ total: number }[]>(Prisma.sql`
        SELECT COALESCE(SUM(jumlah * COALESCE(harga_satuan, 0)), 0)::float8 AS total
        FROM aset
        WHERE dihapus_pada IS NULL
          AND sekolah_id IN (${Prisma.join(ids)})
      `),
      prisma.aset.findMany({
        where,
        orderBy: { dibuatPada: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          kategoriAset: { select: { nama: true } },
          sekolah: { select: { nama: true } },
        },
      }),
    ]);
  const totalUnitBarang = angka(totalUnit._sum.jumlah);
  const kondisiBaik = angka(unitBaik._sum.jumlah);
  return successResponse(res, "Berhasil mengambil data inventaris", {
    ringkasan: {
      totalUnitBarang,
      totalNilaiAset: angka(nilaiRows[0]?.total),
      kondisiBaik,
      perluPerhatian: Math.max(0, totalUnitBarang - kondisiBaik),
    },
    daftarBarang: daftar.map((a) => ({
      id: a.id,
      namaBarang: a.nama,
      kategori: a.kategoriAset?.nama ?? null,
      unitSekolah: a.sekolah?.nama ?? null,
      lokasi: a.lokasi,
      jumlah: a.jumlah,
      kondisi: a.kondisi,
      nilaiAset: angka(a.hargaSatuan) * a.jumlah,
      tanggalPerolehan: a.tanggalPembelian,
    })),
    pagination: {
      page,
      limit,
      total: totalBaris,
      totalPages: Math.max(1, Math.ceil(totalBaris / limit)),
    },
  });
});

export const monitoringKehadiran = bungkus(async (req, res) => {
  const { sekolah, ids } = await ambilKonteks(req);
  const rekap = await Promise.all(ids.map((id) => rekapAbsensi(id)));
  const perSekolah = sekolah.map((s, i) => {
    const r = rekap[i]!;
    return {
      sekolahId: s.id,
      namaSekolah: s.nama,
      totalAbsen: r.total,
      hadir: r.hadir,
      izin: r.izin,
      sakit: r.sakit,
      alpha: r.alpha,
      persentase: persen(r.hadir, r.total),
    };
  });
  return successResponse(res, "Berhasil mengambil monitoring kehadiran", {
    ringkasan: {
      persentaseGlobal: persen(
        jumlah(perSekolah.map((p) => p.hadir)),
        jumlah(perSekolah.map((p) => p.totalAbsen)),
      ),
    },
    perSekolah,
  });
});

export const monitoringLms = bungkus(async (req, res) => {
  const { sekolah, ids } = await ambilKonteks(req);
  if (ids.length === 0) {
    return successResponse(res, "Berhasil mengambil monitoring LMS", {
      ringkasan: { totalMateri: 0, totalTugas: 0, rataPengumpulanTugas: "0%" },
      perSekolah: [],
    });
  }
  const daftarId = Prisma.join(ids);
  const [materi, tugas, dikumpulkan, diharapkan, siswa] = await Promise.all([
    kelompok(Prisma.sql`
      SELECT k.sekolah_id, COUNT(m.id)::int AS jumlah
      FROM materi_pembelajaran m
      JOIN kelas_mapel km ON km.id = m.kelas_mapel_id
      JOIN kelas k ON k.id = km.kelas_id
      WHERE m.dihapus_pada IS NULL AND k.sekolah_id IN (${daftarId})
      GROUP BY k.sekolah_id
    `),
    kelompok(Prisma.sql`
      SELECT k.sekolah_id, COUNT(t.id)::int AS jumlah
      FROM tugas t
      JOIN kelas_mapel km ON km.id = t.kelas_mapel_id
      JOIN kelas k ON k.id = km.kelas_id
      WHERE t.dihapus_pada IS NULL AND k.sekolah_id IN (${daftarId})
      GROUP BY k.sekolah_id
    `),
    kelompok(Prisma.sql`
      SELECT k.sekolah_id, COUNT(p.id)::int AS jumlah
      FROM pengumpulan_tugas p
      JOIN tugas t ON t.id = p.tugas_id
      JOIN kelas_mapel km ON km.id = t.kelas_mapel_id
      JOIN kelas k ON k.id = km.kelas_id
      WHERE t.dihapus_pada IS NULL AND k.sekolah_id IN (${daftarId})
      GROUP BY k.sekolah_id
    `),
    kelompok(Prisma.sql`
      SELECT k.sekolah_id, COUNT(ak.id)::int AS jumlah
      FROM tugas t
      JOIN kelas_mapel km ON km.id = t.kelas_mapel_id
      JOIN kelas k ON k.id = km.kelas_id
      JOIN anggota_kelas ak ON ak.kelas_id = k.id AND ak.dihapus_pada IS NULL
      WHERE t.dihapus_pada IS NULL AND k.sekolah_id IN (${daftarId})
      GROUP BY k.sekolah_id
    `),
    hitungSiswa(ids),
  ]);
  const perSekolah = sekolah.map((s) => ({
    sekolahId: s.id,
    namaSekolah: s.nama,
    jumlahMateri: materi.get(s.id) ?? 0,
    jumlahTugas: tugas.get(s.id) ?? 0,
    tugasDikumpulkan: dikumpulkan.get(s.id) ?? 0,
    totalSiswa: siswa.get(s.id)?.total ?? 0,
  }));
  const totalDikumpulkan = jumlah([...dikumpulkan.values()]);
  const totalDiharapkan = jumlah([...diharapkan.values()]);
  return successResponse(res, "Berhasil mengambil monitoring LMS", {
    ringkasan: {
      totalMateri: jumlah(perSekolah.map((p) => p.jumlahMateri)),
      totalTugas: jumlah(perSekolah.map((p) => p.jumlahTugas)),
      rataPengumpulanTugas: `${Math.min(100, persen(totalDikumpulkan, totalDiharapkan))}%`,
    },
    perSekolah,
  });
});

export const monitoringNilai = bungkus(async (req, res) => {
  const { sekolah, ids } = await ambilKonteks(req);
  const [nilai, predikat] = await Promise.all([
    statistikNilai(ids),
    ids.length
      ? prisma.nilaiAkhirMapel.groupBy({
          by: ["predikat"],
          where: { sekolahId: { in: ids }, dihapusPada: null },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);
  const distribusiPredikat: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  predikat.forEach((p) => {
    const kunci = p.predikat.trim().toUpperCase();
    distribusiPredikat[kunci] = (distribusiPredikat[kunci] ?? 0) + p._count._all;
  });
  const total = jumlah([...nilai.values()].map((n) => n.total));
  const bobotRata = jumlah(
    [...nilai.values()].map((n) => angka(n.rata) * n.total),
  );
  return successResponse(res, "Berhasil mengambil monitoring nilai", {
    ringkasan: {
      rataRataKeseluruhan: total > 0 ? bulat(bobotRata / total) : 0,
      jumlahSiswaDiBawahKKM: jumlah(
        [...nilai.values()].map((n) => n.siswa_di_bawah),
      ),
    },
    distribusiPredikat,
    perSekolah: sekolah.map((s) => {
      const n = nilai.get(s.id);
      return {
        sekolahId: s.id,
        namaSekolah: s.nama,
        rataNilai: bulat(angka(n?.rata)),
        tertinggi: angka(n?.tertinggi),
        terendah: angka(n?.terendah),
      };
    }),
  });
});