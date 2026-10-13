import { NextFunction, Response } from "express";
import { Prisma } from "@prisma/client";

import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  getKkmConfig,
  hitungPredikat,
  resolveKkm,
  round2,
} from "../utils/kkm";

const JENIS_RAPOT = ["tengah_semester", "akhir_semester"];

const getAuth = (req: AuthRequest) => {
  const userId = req.user?.userId;
  const sekolahId = req.user?.sekolahId;
  if (!userId || !sekolahId) throw new AppError("Akses ditolak", 403);
  return { userId, sekolahId };
};

const getPeranNama = async (userId: string) => {
  const user = await prisma.pengguna.findUnique({
    where: { id: userId },
    select: { peran: { select: { nama: true } } },
  });
  return user?.peran?.nama?.toLowerCase() ?? null;
};

const loadKelasWali = async (
  kelasId: string,
  userId: string,
  sekolahId: string,
) => {
  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId, dihapusOleh: null },
    include: {
      tahunAjaran: {
        select: {
          id: true,
          tahunAjaran: true,
          semester: true,
          tanggalMulai: true,
          tanggalSelesai: true,
        },
      },
    },
  });

  if (!kelas) throw new AppError("Kelas tidak ditemukan", 404);
  if (kelas.waliKelasId !== userId)
    throw new AppError("Anda bukan wali kelas dari kelas ini", 403);

  return kelas;
};

const loadRapotWali = async (
  rapotId: string,
  userId: string,
  sekolahId: string,
) => {
  const rapot = await prisma.rapot.findFirst({
    where: { id: rapotId, sekolahId, dihapusOleh: null },
    include: { kelas: { select: { waliKelasId: true } } },
  });

  if (!rapot) throw new AppError("Rapot tidak ditemukan", 404);
  if (rapot.kelas.waliKelasId !== userId)
    throw new AppError("Anda bukan wali kelas dari kelas ini", 403);

  return rapot;
};

export const getKelasWali = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);

    const kelas = await prisma.kelas.findMany({
      where: { waliKelasId: userId, sekolahId, dihapusOleh: null },
      include: {
        tahunAjaran: {
          select: { id: true, tahunAjaran: true, semester: true, status: true },
        },
        _count: { select: { anggota: true, rapot: true } },
      },
      orderBy: { nama: "asc" },
    });

    return successResponse(res, "Daftar kelas yang diwalikan berhasil diambil", kelas);
  } catch (error) {
    next(error);
  }
};

export const generateRapot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const kelasId = String(req.params.kelasId);
    const { jenisRapot, overwrite } = req.body ?? {};

    if (!JENIS_RAPOT.includes(jenisRapot))
      throw new AppError(
        "jenisRapot harus tengah_semester atau akhir_semester",
        400,
      );

    const kelas = await loadKelasWali(kelasId, userId, sekolahId);
    const tahunAjaran = kelas.tahunAjaran;
    const semester = tahunAjaran.semester;

    const kelasMapel = await prisma.kelasMapel.findMany({
      where: { kelasId, dihapusOleh: null },
      include: { mataPelajaran: { select: { nama: true } } },
    });
    if (kelasMapel.length === 0)
      throw new AppError("Kelas ini belum memiliki mata pelajaran", 400);

    const nilaiAkhir = await prisma.nilaiAkhirMapel.findMany({
      where: {
        kelasMapelId: { in: kelasMapel.map((k) => k.id) },
        status: "final",
        dihapusOleh: null,
      },
    });
    const finalIds = new Set(nilaiAkhir.map((n) => n.kelasMapelId));
    const belumFinal = kelasMapel.filter((k) => !finalIds.has(k.id));

    if (belumFinal.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada mata pelajaran yang belum difinalisasi",
        data: belumFinal.map((k) => ({
          kelasMapelId: k.id,
          mataPelajaran: k.mataPelajaran.nama,
        })),
      });
    }

    const rapotLama = await prisma.rapot.findMany({
      where: {
        kelasId,
        tahunAjaranId: tahunAjaran.id,
        semester,
        jenisRapot,
        dihapusOleh: null,
      },
      select: { id: true, pengguna: { select: { namaLengkap: true } }, status: true },
    });

    if (rapotLama.length > 0) {
      if (overwrite !== true) {
        return res.status(409).json({
          success: false,
          message:
            "Rapot periode ini sudah pernah digenerate. Kirim overwrite: true untuk menimpa rapot draft",
        });
      }
      const published = rapotLama.filter((r) => r.status === "published");
      if (published.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Ada rapot yang sudah dipublish. Unpublish dulu sebelum overwrite",
          data: published.map((r) => ({
            rapotId: r.id,
            namaLengkap: r.pengguna.namaLengkap,
          })),
        });
      }
    }

    const anggota = await prisma.anggotaKelas.findMany({
      where: { kelasId, dihapusOleh: null },
      select: { penggunaId: true },
    });
    const siswaIds = Array.from(new Set(anggota.map((a) => a.penggunaId)));
    if (siswaIds.length === 0)
      throw new AppError("Tidak ada siswa di kelas ini", 400);

    const rentang: Prisma.AbsensiWhereInput = {};
    if (tahunAjaran.tanggalMulai || tahunAjaran.tanggalSelesai) {
      rentang.tanggal = {
        ...(tahunAjaran.tanggalMulai ? { gte: tahunAjaran.tanggalMulai } : {}),
        ...(tahunAjaran.tanggalSelesai ? { lte: tahunAjaran.tanggalSelesai } : {}),
      };
    }
    const absensi = await prisma.absensi.groupBy({
      by: ["penggunaId", "status"],
      where: {
        kelasId,
        penggunaId: { in: siswaIds },
        dihapusOleh: null,
        ...rentang,
      },
      _count: { _all: true },
    });

    const absenMap = new Map<
      string,
      { hadir: number; izin: number; sakit: number; alpha: number }
    >();
    siswaIds.forEach((id) =>
      absenMap.set(id, { hadir: 0, izin: 0, sakit: 0, alpha: 0 }),
    );
    absensi.forEach((a) => {
      const rekap = absenMap.get(a.penggunaId);
      if (!rekap) return;
      const kode = a.status.trim().toLowerCase().charAt(0);
      if (kode === "h") rekap.hadir += a._count._all;
      else if (kode === "i") rekap.izin += a._count._all;
      else if (kode === "s") rekap.sakit += a._count._all;
      else if (kode === "a") rekap.alpha += a._count._all;
    });

    const nilaiMap = new Map<string, (typeof nilaiAkhir)[number]>();
    nilaiAkhir.forEach((n) => nilaiMap.set(`${n.kelasMapelId}:${n.penggunaId}`, n));

    const rows = siswaIds.map((penggunaId) => {
      const snapshot = kelasMapel.map((km) => {
        const n = nilaiMap.get(`${km.id}:${penggunaId}`);
        return {
          kelasMapelId: km.id,
          mapel: km.mataPelajaran.nama,
          nilaiAkhir: n ? Number(n.nilaiAkhir) : null,
          predikat: n ? n.predikat : null,
          kkm: n ? n.kkm : null,
        };
      });
      const terisi = snapshot.filter((s) => s.nilaiAkhir !== null);
      const rataRata = terisi.length
        ? round2(
            terisi.reduce((acc, s) => acc + (s.nilaiAkhir as number), 0) /
              terisi.length,
          )
        : 0;
      return { penggunaId, snapshot, rataRata, ranking: 0 };
    });

    const urut = [...rows].sort((a, b) => b.rataRata - a.rataRata);
    let rank = 0;
    let prev: number | null = null;
    urut.forEach((r, i) => {
      if (prev === null || r.rataRata !== prev) {
        rank = i + 1;
        prev = r.rataRata;
      }
      r.ranking = rank;
    });

    const ops = rows.map((r) => {
      const absen = absenMap.get(r.penggunaId)!;
      const data = {
        sekolahId,
        nilaiSnapshot: r.snapshot as Prisma.InputJsonValue,
        rataRata: r.rataRata,
        ranking: r.ranking,
        jumlahHadir: absen.hadir,
        jumlahIzin: absen.izin,
        jumlahSakit: absen.sakit,
        jumlahAlpha: absen.alpha,
        dihapusOleh: null,
        dihapusPada: null,
      };

      return prisma.rapot.upsert({
        where: {
          penggunaId_kelasId_tahunAjaranId_semester_jenisRapot: {
            penggunaId: r.penggunaId,
            kelasId,
            tahunAjaranId: tahunAjaran.id,
            semester,
            jenisRapot,
          },
        },
        update: { ...data, diperbaruiOleh: userId },
        create: {
          ...data,
          penggunaId: r.penggunaId,
          kelasId,
          tahunAjaranId: tahunAjaran.id,
          semester,
          jenisRapot,
          status: "draft",
          dibuatOleh: userId,
        },
      });
    });

    await prisma.$transaction(ops);

    return successResponse(
      res,
      "Rapot berhasil digenerate (status draft)",
      {
        kelasId,
        semester,
        jenisRapot,
        jumlahRapot: ops.length,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const listRapotKelas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const kelasId = String(req.params.kelasId);
    const { jenisRapot } = req.query;

    await loadKelasWali(kelasId, userId, sekolahId);

    const rapot = await prisma.rapot.findMany({
      where: {
        kelasId,
        sekolahId,
        dihapusOleh: null,
        ...(jenisRapot ? { jenisRapot: String(jenisRapot) } : {}),
      },
      include: {
        pengguna: {
          select: { id: true, namaLengkap: true, nis: true, nisn: true },
        },
      },
      orderBy: [{ ranking: "asc" }],
    });

    return successResponse(res, "Daftar rapot kelas berhasil diambil", rapot);
  } catch (error) {
    next(error);
  }
};

export const isiCatatanRapot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const rapotId = String(req.params.rapotId);
    const { catatanWaliKelas, keterangan } = req.body ?? {};

    if (catatanWaliKelas === undefined && keterangan === undefined)
      throw new AppError("catatanWaliKelas atau keterangan wajib diisi", 400);
    if (catatanWaliKelas !== undefined && typeof catatanWaliKelas !== "string")
      throw new AppError("catatanWaliKelas harus berupa teks", 400);
    if (keterangan !== undefined && typeof keterangan !== "string")
      throw new AppError("keterangan harus berupa teks", 400);

    const rapot = await loadRapotWali(rapotId, userId, sekolahId);

    if (rapot.status === "published")
      throw new AppError(
        "Rapot sudah dipublish. Unpublish dulu sebelum mengubah catatan",
        409,
      );

    const updated = await prisma.rapot.update({
      where: { id: rapotId },
      data: {
        ...(catatanWaliKelas !== undefined ? { catatanWaliKelas } : {}),
        ...(keterangan !== undefined ? { keterangan } : {}),
        diperbaruiOleh: userId,
      },
    });

    return successResponse(res, "Catatan rapot berhasil disimpan", updated);
  } catch (error) {
    next(error);
  }
};

export const publishRapot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const rapotId = String(req.params.rapotId);
    const aksi = req.body?.aksi ?? "publish";

    if (aksi !== "publish" && aksi !== "unpublish")
      throw new AppError("aksi harus publish atau unpublish", 400);

    const rapot = await loadRapotWali(rapotId, userId, sekolahId);

    if (aksi === "publish") {
      if (rapot.status !== "draft")
        throw new AppError("Rapot hanya bisa dipublish dari status draft", 400);

      const updated = await prisma.rapot.update({
        where: { id: rapotId },
        data: {
          status: "published",
          dipublishOleh: userId,
          dipublishPada: new Date(),
          diperbaruiOleh: userId,
        },
      });
      return successResponse(res, "Rapot berhasil dipublish", updated);
    }

    if (rapot.status !== "published")
      throw new AppError(
        "Rapot hanya bisa di-unpublish dari status published",
        400,
      );

    const updated = await prisma.rapot.update({
      where: { id: rapotId },
      data: {
        status: "draft",
        dipublishOleh: null,
        dipublishPada: null,
        diperbaruiOleh: userId,
      },
    });
    return successResponse(res, "Rapot berhasil di-unpublish", updated);
  } catch (error) {
    next(error);
  }
};

export const listRapotSaya = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);

    const rapot = await prisma.rapot.findMany({
      where: {
        penggunaId: userId,
        sekolahId,
        status: "published",
        dihapusOleh: null,
      },
      select: {
        id: true,
        semester: true,
        jenisRapot: true,
        rataRata: true,
        ranking: true,
        dipublishPada: true,
        kelas: { select: { id: true, nama: true } },
        tahunAjaran: { select: { id: true, tahunAjaran: true, semester: true } },
      },
      orderBy: { dipublishPada: "desc" },
    });

    return successResponse(res, "Daftar rapot berhasil diambil", rapot);
  } catch (error) {
    next(error);
  }
};

export const detailRapotSaya = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const rapotId = String(req.params.rapotId);

    const rapot = await prisma.rapot.findFirst({
      where: { id: rapotId, sekolahId, dihapusOleh: null },
      include: {
        pengguna: {
          select: { namaLengkap: true, nis: true, nisn: true },
        },
        kelas: { select: { id: true, nama: true } },
        tahunAjaran: { select: { id: true, tahunAjaran: true, semester: true } },
      },
    });

    if (!rapot) throw new AppError("Rapot tidak ditemukan", 404);
    if (rapot.penggunaId !== userId)
      throw new AppError("Anda tidak berhak mengakses rapot ini", 403);
    if (rapot.status !== "published")
      throw new AppError("Rapot tidak ditemukan", 404);

    return successResponse(res, "Detail rapot berhasil diambil", {
      id: rapot.id,
      identitas: {
        nama: rapot.pengguna.namaLengkap,
        nis: rapot.pengguna.nis,
        nisn: rapot.pengguna.nisn,
        kelas: rapot.kelas.nama,
      },
      tahunAjaran: rapot.tahunAjaran,
      semester: rapot.semester,
      jenisRapot: rapot.jenisRapot,
      akademik: rapot.nilaiSnapshot,
      rataRata: rapot.rataRata,
      ranking: rapot.ranking,
      kehadiran: {
        hadir: rapot.jumlahHadir,
        izin: rapot.jumlahIzin,
        sakit: rapot.jumlahSakit,
        alpha: rapot.jumlahAlpha,
      },
      catatanWaliKelas: rapot.catatanWaliKelas,
      dipublishPada: rapot.dipublishPada,
    });
  } catch (error) {
    next(error);
  }
};

export const getDataRaportSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const siswaId = String(req.params.siswaId);
    const tahunAjaranId = String(req.params.tahunAjaranId);

    if (!siswaId || !tahunAjaranId)
      throw new AppError("Parameter siswa atau tahun ajaran tidak valid", 400);

    const peran = await getPeranNama(userId);
    const isSiswa = peran === "siswa";

    if (isSiswa && siswaId !== userId)
      throw new AppError("Anda tidak berhak mengakses data ini", 403);

    const siswa = await prisma.pengguna.findFirst({
      where: { id: siswaId, sekolahId },
      include: {
        kelasSiswa: {
          where: { tahunAjaranId, dihapusOleh: null },
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

    if (peran === "guru" && kelasSiswa.waliKelasId !== userId)
      throw new AppError("Anda bukan wali kelas dari siswa ini", 403);

    const rapot = await prisma.rapot.findFirst({
      where: {
        penggunaId: siswaId,
        tahunAjaranId,
        sekolahId,
        dihapusOleh: null,
        ...(isSiswa ? { status: "published" } : {}),
      },
      orderBy: { dibuatPada: "desc" },
    });
    if (isSiswa && !rapot) throw new AppError("Rapot belum dipublish", 404);

    const config = await getKkmConfig(sekolahId);

    const nilai = await prisma.nilai.findMany({
      where: {
        penggunaId: siswaId,
        kelasMapel: { kelasId: kelasSiswa.id },
        dihapusOleh: null,
      },
      include: {
        kelasMapel: { include: { mataPelajaran: true } },
        komponenNilai: true,
      },
    });

    const rekapNilai: Record<
      string,
      { mapel: string; totalNilai: number; kkm: number }
    > = {};
    nilai.forEach((n) => {
      const namaMapel = n.kelasMapel.mataPelajaran.nama;
      if (!rekapNilai[namaMapel]) {
        rekapNilai[namaMapel] = {
          mapel: namaMapel,
          totalNilai: 0,
          kkm: resolveKkm(config, namaMapel),
        };
      }
      const bobot = Number(n.komponenNilai.bobot) / 100;
      rekapNilai[namaMapel].totalNilai += Number(n.nilai) * bobot;
    });

    const absensi = await prisma.absensi.groupBy({
      by: ["status"],
      where: {
        penggunaId: siswaId,
        kelasId: kelasSiswa.id,
        dihapusOleh: null,
      },
      _count: { _all: true },
    });

    const rekapAbsensi = { hadir: 0, izin: 0, sakit: 0, alpha: 0 };
    absensi.forEach((a) => {
      const kode = a.status.trim().toLowerCase().charAt(0);
      if (kode === "h") rekapAbsensi.hadir += a._count._all;
      else if (kode === "i") rekapAbsensi.izin += a._count._all;
      else if (kode === "s") rekapAbsensi.sakit += a._count._all;
      else if (kode === "a") rekapAbsensi.alpha += a._count._all;
    });

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
        predikat: hitungPredikat(n.totalNilai, n.kkm),
      })),
      kehadiran: rekapAbsensi,
      catatanWaliKelas: rapot?.catatanWaliKelas ?? null,
    });
  } catch (error) {
    next(error);
  }
};