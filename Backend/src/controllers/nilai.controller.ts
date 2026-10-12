import { NextFunction, Response } from "express";
import ExcelJS from "exceljs";

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

const getAuth = (req: AuthRequest) => {
  const userId = req.user?.userId;
  const sekolahId = req.user?.sekolahId;
  if (!userId || !sekolahId) throw new AppError("Akses ditolak", 403);
  return { userId, sekolahId };
};

const loadKelasMapelGuru = async (
  kelasMapelId: string,
  userId: string,
  sekolahId: string,
) => {
  const km = await prisma.kelasMapel.findFirst({
    where: { id: kelasMapelId, dihapusOleh: null, kelas: { sekolahId } },
    include: {
      kelas: { select: { id: true, nama: true, tahunAjaranId: true } },
      mataPelajaran: { select: { id: true, nama: true } },
    },
  });

  if (!km) throw new AppError("Kelas mapel tidak ditemukan", 404);
  if (km.guruPengajarId !== userId)
    throw new AppError("Anda bukan guru pengampu kelas mapel ini", 403);

  return km;
};

const isFinalized = async (kelasMapelId: string) => {
  const jumlah = await prisma.nilaiAkhirMapel.count({
    where: { kelasMapelId, status: "final", dihapusOleh: null },
  });
  return jumlah > 0;
};

const getSiswaKelas = async (kelasId: string) => {
  const anggota = await prisma.anggotaKelas.findMany({
    where: { kelasId, dihapusOleh: null },
    include: {
      siswa: {
        select: { id: true, namaLengkap: true, nis: true, nisn: true },
      },
    },
    orderBy: { siswa: { namaLengkap: "asc" } },
  });

  const map = new Map<string, (typeof anggota)[number]["siswa"]>();
  anggota.forEach((a) => map.set(a.siswa.id, a.siswa));
  return Array.from(map.values());
};

const parseAngka = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const exportRekapNilai = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const { kelasId, kelasMapelId } = req.query;

    const nilaiWhere: any = {
      pengguna: {
        sekolahId,
      },
      dihapusOleh: null,
    };

    if (kelasId) {
      nilaiWhere.kelasMapel = {
        kelasId: String(kelasId),
      };
    }

    if (kelasMapelId) {
      nilaiWhere.kelasMapelId = String(kelasMapelId);
    }

    const nilai = await prisma.nilai.findMany({
      where: nilaiWhere,
      include: {
        pengguna: {
          select: {
            namaLengkap: true,
            nisn: true,
            nis: true,
          },
        },
        kelasMapel: {
          include: {
            kelas: {
              select: {
                nama: true,
              },
            },
            mataPelajaran: {
              select: {
                nama: true,
              },
            },
          },
        },
        komponenNilai: {
          select: {
            nama: true,
            jenis: true,
            kelompok: true,
          },
        },
      },
      orderBy: {
        pengguna: {
          namaLengkap: "asc",
        },
      },
    });

    const hasilAsesmen = await prisma.hasilAsesmen.findMany({
      where: {
        dihapusOleh: null,
        percobaanAsesmen: {
          pengguna: {
            sekolahId,
          },
          asesmen: {
            kelasMapel: {
              ...(kelasMapelId
                ? {
                    id: String(kelasMapelId),
                  }
                : {}),
              ...(kelasId
                ? {
                    kelasId: String(kelasId),
                  }
                : {}),
            },
          },
        },
      },
      include: {
        percobaanAsesmen: {
          include: {
            pengguna: {
              select: {
                namaLengkap: true,
                nisn: true,
                nis: true,
              },
            },
            asesmen: {
              include: {
                kelasMapel: {
                  include: {
                    kelas: {
                      select: {
                        nama: true,
                      },
                    },
                    mataPelajaran: {
                      select: {
                        nama: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        percobaanAsesmen: {
          pengguna: {
            namaLengkap: "asc",
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheetUjian = workbook.addWorksheet("Hasil Asesmen");

    worksheetUjian.columns = [
      { header: "No", key: "no", width: 8 },
      { header: "Nama Siswa", key: "nama", width: 30 },
      { header: "NISN", key: "nisn", width: 20 },
      { header: "NIS", key: "nis", width: 20 },
      { header: "Kelas", key: "kelas", width: 20 },
      { header: "Mata Pelajaran", key: "mapel", width: 25 },
      { header: "Asesmen", key: "asesmen", width: 30 },
      { header: "Nilai", key: "nilai", width: 15 },
    ];

    hasilAsesmen.forEach((item, index) => {
      worksheetUjian.addRow({
        no: index + 1,
        nama: item.percobaanAsesmen.pengguna.namaLengkap,
        nisn: item.percobaanAsesmen.pengguna.nisn ?? "",
        nis: item.percobaanAsesmen.pengguna.nis ?? "",
        kelas: item.percobaanAsesmen.asesmen.kelasMapel.kelas.nama,
        mapel: item.percobaanAsesmen.asesmen.kelasMapel.mataPelajaran.nama,
        asesmen: item.percobaanAsesmen.asesmen.judul,
        nilai: Number(item.totalNilai),
      });
    });

    worksheetUjian.getRow(1).font = {
      bold: true,
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rekap-nilai.xlsx"',
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error("Error export rekap nilai:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengekspor rekap nilai",
    });
  }
};

export const getKelasSaya = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);

    const kelasMapel = await prisma.kelasMapel.findMany({
      where: {
        guruPengajarId: userId,
        dihapusOleh: null,
        kelas: { sekolahId },
      },
      include: {
        kelas: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
            tahunAjaranId: true,
            _count: { select: { anggota: true } },
          },
        },
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
      },
      orderBy: { dibuatPada: "asc" },
    });

    const ids = kelasMapel.map((k) => k.id);
    const final = ids.length
      ? await prisma.nilaiAkhirMapel.groupBy({
          by: ["kelasMapelId"],
          where: {
            kelasMapelId: { in: ids },
            status: "final",
            dihapusOleh: null,
          },
          _count: { _all: true },
        })
      : [];
    const finalSet = new Set(final.map((f) => f.kelasMapelId));

    const data = kelasMapel.map((k) => ({
      kelasMapelId: k.id,
      kelas: k.kelas,
      mataPelajaran: k.mataPelajaran,
      status: finalSet.has(k.id) ? "final" : "draft",
    }));

    return successResponse(res, "Daftar kelas yang diampu berhasil diambil", data);
  } catch (error) {
    next(error);
  }
};

export const getKomponenNilaiByMapel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const kelasMapelId = String(req.params.kelasMapelId);

    await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    const komponen = await prisma.komponenNilai.findMany({
      where: { kelasMapelId, dihapusOleh: null },
      orderBy: { dibuatPada: "asc" },
    });

    const totalBobot = round2(
      komponen.reduce((acc, k) => acc + Number(k.bobot), 0),
    );

    return successResponse(res, "Komponen nilai berhasil diambil", {
      komponen,
      totalBobot,
      sisaBobot: round2(100 - totalBobot),
      status: (await isFinalized(kelasMapelId)) ? "final" : "draft",
    });
  } catch (error) {
    next(error);
  }
};

export const createKomponenNilai = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const { kelasMapelId, nama, jenis, bobot, nilaiMaksimum, kelompok } =
      req.body ?? {};

    if (!kelasMapelId || typeof kelasMapelId !== "string")
      throw new AppError("kelasMapelId wajib diisi", 400);

    const namaBersih = typeof nama === "string" ? nama.trim() : "";
    if (!namaBersih) throw new AppError("Nama komponen wajib diisi", 400);

    const bobotNum = parseAngka(bobot);
    if (bobotNum === null || bobotNum < 0 || bobotNum > 100)
      throw new AppError("Bobot harus berupa angka 0–100", 400);

    await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    if (await isFinalized(kelasMapelId))
      throw new AppError(
        "Nilai sudah difinalisasi, komponen tidak dapat ditambah",
        400,
      );

    const existing = await prisma.komponenNilai.findMany({
      where: { kelasMapelId, dihapusOleh: null },
      select: { bobot: true },
    });
    const totalLama = existing.reduce((acc, k) => acc + Number(k.bobot), 0);
    const totalBaru = round2(totalLama + bobotNum);

    if (totalBaru > 100) {
      throw new AppError(
        `Total bobot melebihi 100% (saat ini ${round2(totalLama)}%, sisa ${round2(100 - totalLama)}%)`,
        400,
      );
    }

    const maks = nilaiMaksimum === undefined ? 100 : parseAngka(nilaiMaksimum);
    if (maks === null || maks <= 0 || maks > 100)
      throw new AppError("nilaiMaksimum harus berupa angka 1–100", 400);

    const komponen = await prisma.komponenNilai.create({
      data: {
        kelasMapelId,
        nama: namaBersih,
        jenis: typeof jenis === "string" && jenis.trim() ? jenis.trim() : "lainnya",
        bobot: bobotNum,
        nilaiMaksimum: maks,
        kelompok:
          typeof kelompok === "string" && kelompok.trim()
            ? kelompok.trim()
            : "umum",
        dibuatOleh: userId,
      },
    });

    return successResponse(res, "Komponen nilai berhasil dibuat", komponen, 201);
  } catch (error) {
    next(error);
  }
};

export const getGridNilai = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const kelasMapelId = String(req.params.kelasMapelId);

    const km = await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    const [komponen, siswa, nilai, final] = await Promise.all([
      prisma.komponenNilai.findMany({
        where: { kelasMapelId, dihapusOleh: null },
        orderBy: { dibuatPada: "asc" },
      }),
      getSiswaKelas(km.kelasId),
      prisma.nilai.findMany({
        where: { kelasMapelId, dihapusOleh: null },
        select: { penggunaId: true, komponenNilaiId: true, nilai: true },
      }),
      isFinalized(kelasMapelId),
    ]);

    const nilaiMap = new Map<string, number>();
    nilai.forEach((n) =>
      nilaiMap.set(`${n.penggunaId}:${n.komponenNilaiId}`, Number(n.nilai)),
    );

    return successResponse(res, "Grid nilai berhasil diambil", {
      kelasMapelId,
      kelas: km.kelas,
      mataPelajaran: km.mataPelajaran,
      status: final ? "final" : "draft",
      komponen: komponen.map((k) => ({
        id: k.id,
        nama: k.nama,
        jenis: k.jenis,
        bobot: Number(k.bobot),
      })),
      siswa: siswa.map((s) => ({
        penggunaId: s.id,
        namaLengkap: s.namaLengkap,
        nis: s.nis,
        nisn: s.nisn,
        nilai: Object.fromEntries(
          komponen.map((k) => [
            k.id,
            nilaiMap.get(`${s.id}:${k.id}`) ?? null,
          ]),
        ),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const inputNilaiBulk = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const { kelasMapelId, nilai } = req.body ?? {};

    if (!kelasMapelId || typeof kelasMapelId !== "string")
      throw new AppError("kelasMapelId wajib diisi", 400);
    if (!Array.isArray(nilai) || nilai.length === 0)
      throw new AppError("Data nilai wajib berupa array dan tidak kosong", 400);
    if (nilai.length > 5000)
      throw new AppError("Maksimal 5000 data nilai per request", 400);

    const km = await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    if (await isFinalized(kelasMapelId))
      throw new AppError(
        "Nilai sudah difinalisasi dan tidak dapat diubah",
        400,
      );

    const [komponen, siswa] = await Promise.all([
      prisma.komponenNilai.findMany({
        where: { kelasMapelId, dihapusOleh: null },
        select: { id: true },
      }),
      getSiswaKelas(km.kelasId),
    ]);
    const komponenIds = new Set(komponen.map((k) => k.id));
    const siswaIds = new Set(siswa.map((s) => s.id));

    const errors: { index: number; pesan: string }[] = [];
    const bersih = new Map<
      string,
      { penggunaId: string; komponenNilaiId: string; nilai: number; catatan?: string }
    >();

    nilai.forEach((item: any, index: number) => {
      const penggunaId = item?.penggunaId;
      const komponenNilaiId = item?.komponenNilaiId;
      const angka = parseAngka(item?.nilai);

      if (typeof penggunaId !== "string" || !siswaIds.has(penggunaId)) {
        errors.push({ index, pesan: "Siswa tidak terdaftar di kelas mapel ini" });
        return;
      }
      if (typeof komponenNilaiId !== "string" || !komponenIds.has(komponenNilaiId)) {
        errors.push({ index, pesan: "Komponen tidak ditemukan di kelas mapel ini" });
        return;
      }
      if (angka === null || angka < 0 || angka > 100) {
        errors.push({ index, pesan: "Nilai harus berupa angka 0–100" });
        return;
      }

      bersih.set(`${penggunaId}:${komponenNilaiId}`, {
        penggunaId,
        komponenNilaiId,
        nilai: angka,
        catatan: typeof item?.catatan === "string" ? item.catatan : undefined,
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Terdapat data nilai yang tidak valid, tidak ada yang disimpan",
        data: errors,
      });
    }

    const existing = await prisma.nilai.findMany({
      where: { kelasMapelId, dihapusOleh: null },
      select: { id: true, penggunaId: true, komponenNilaiId: true },
    });
    const existingMap = new Map<string, string>();
    existing.forEach((e) =>
      existingMap.set(`${e.penggunaId}:${e.komponenNilaiId}`, e.id),
    );

    const ops = Array.from(bersih.entries()).map(([key, v]) => {
      const idLama = existingMap.get(key);
      if (idLama) {
        return prisma.nilai.update({
          where: { id: idLama },
          data: {
            nilai: v.nilai,
            ...(v.catatan !== undefined ? { catatan: v.catatan } : {}),
            diperbaruiOleh: userId,
          },
        });
      }
      return prisma.nilai.create({
        data: {
          penggunaId: v.penggunaId,
          kelasMapelId,
          komponenNilaiId: v.komponenNilaiId,
          nilai: v.nilai,
          sumber: "manual",
          catatan: v.catatan,
          dibuatOleh: userId,
        },
      });
    });

    await prisma.$transaction(ops);

    return successResponse(res, "Nilai berhasil disimpan", {
      jumlahDisimpan: ops.length,
    });
  } catch (error) {
    next(error);
  }
};

export const finalisasiNilai = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const kelasMapelId = String(req.params.kelasMapelId);

    const km = await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    if (await isFinalized(kelasMapelId))
      throw new AppError("Nilai sudah difinalisasi", 400);

    const komponen = await prisma.komponenNilai.findMany({
      where: { kelasMapelId, dihapusOleh: null },
      orderBy: { dibuatPada: "asc" },
    });

    if (komponen.length === 0)
      throw new AppError("Belum ada komponen nilai", 400);

    const totalBobot = round2(
      komponen.reduce((acc, k) => acc + Number(k.bobot), 0),
    );
    if (totalBobot !== 100) {
      return res.status(400).json({
        success: false,
        message: `Total bobot komponen harus 100% (saat ini ${totalBobot}%)`,
        data: komponen.map((k) => ({
          id: k.id,
          nama: k.nama,
          bobot: Number(k.bobot),
        })),
      });
    }

    const siswa = await getSiswaKelas(km.kelasId);
    if (siswa.length === 0)
      throw new AppError("Tidak ada siswa di kelas ini", 400);

    const nilaiRows = await prisma.nilai.findMany({
      where: { kelasMapelId, dihapusOleh: null },
      select: { penggunaId: true, komponenNilaiId: true, nilai: true },
    });
    const nilaiMap = new Map<string, number>();
    nilaiRows.forEach((n) =>
      nilaiMap.set(`${n.penggunaId}:${n.komponenNilaiId}`, Number(n.nilai)),
    );

    const siswaKosong = siswa
      .map((s) => ({
        penggunaId: s.id,
        namaLengkap: s.namaLengkap,
        komponenKosong: komponen
          .filter((k) => !nilaiMap.has(`${s.id}:${k.id}`))
          .map((k) => k.nama),
      }))
      .filter((s) => s.komponenKosong.length > 0);

    if (siswaKosong.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Masih ada siswa yang belum memiliki nilai di semua komponen",
        data: siswaKosong,
      });
    }

    const config = await getKkmConfig(sekolahId);
    const kkm = resolveKkm(config, km.mataPelajaran.nama);
    const sekarang = new Date();

    const ops = siswa.map((s) => {
      const detail = komponen.map((k) => ({
        komponenId: k.id,
        nama: k.nama,
        nilai: nilaiMap.get(`${s.id}:${k.id}`) as number,
        bobot: Number(k.bobot),
      }));
      const nilaiAkhir = round2(
        detail.reduce((acc, d) => acc + (d.nilai * d.bobot) / 100, 0),
      );
      const data = {
        sekolahId,
        nilaiAkhir,
        predikat: hitungPredikat(nilaiAkhir, kkm),
        kkm,
        totalBobot,
        detailKomponen: detail,
        status: "final",
        difinalkanOleh: userId,
        difinalkanPada: sekarang,
        dihapusOleh: null,
        dihapusPada: null,
      };

      return prisma.nilaiAkhirMapel.upsert({
        where: {
          kelasMapelId_penggunaId: { kelasMapelId, penggunaId: s.id },
        },
        update: { ...data, diperbaruiOleh: userId },
        create: { ...data, kelasMapelId, penggunaId: s.id, dibuatOleh: userId },
      });
    });

    await prisma.$transaction(ops);

    return successResponse(res, "Nilai berhasil difinalisasi", {
      kelasMapelId,
      mataPelajaran: km.mataPelajaran.nama,
      kkm,
      jumlahSiswa: siswa.length,
    });
  } catch (error) {
    next(error);
  }
};