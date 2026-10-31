import fs from "fs";
import { NextFunction, Response } from "express";
import ExcelJS from "exceljs";

import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import { getKkmConfig, hitungPredikat, resolveKkm, round2 } from "../utils/kkm";
import { getAggregateSubject, aggregateWeights } from "../utils/schoolSettings";

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

  if (!km) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
  if (km.guruPengajarId !== userId)
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);

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
      kelasMapel: {
        kelas: {
          sekolahId,
        },
        ...(kelasId ? { kelasId: String(kelasId) } : {}),
      },
      ...(kelasMapelId ? { kelasMapelId: String(kelasMapelId) } : {}),
      dihapusOleh: null,
    };

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
              kelas: {
                sekolahId,
              },
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

    return successResponse(
      res,
      "Daftar kelas yang diampu berhasil diambil",
      data,
    );
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
      where: {
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
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
      where: {
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
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
        jenis:
          typeof jenis === "string" && jenis.trim() ? jenis.trim() : "lainnya",
        bobot: bobotNum,
        nilaiMaksimum: maks,
        kelompok:
          typeof kelompok === "string" && kelompok.trim()
            ? kelompok.trim()
            : "umum",
        dibuatOleh: userId,
      },
    });

    return successResponse(
      res,
      "Komponen nilai berhasil dibuat",
      komponen,
      201,
    );
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
        where: {
          kelasMapelId,
          dihapusOleh: null,
          kelasMapel: { kelas: { sekolahId } },
        },
        orderBy: { dibuatPada: "asc" },
      }),
      getSiswaKelas(km.kelasId),
      prisma.nilai.findMany({
        where: {
          kelasMapelId,
          dihapusOleh: null,
          kelasMapel: { kelas: { sekolahId } },
        },
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
          komponen.map((k) => [k.id, nilaiMap.get(`${s.id}:${k.id}`) ?? null]),
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
        where: {
          kelasMapelId,
          dihapusOleh: null,
          kelasMapel: { kelas: { sekolahId } },
        },
        select: { id: true },
      }),
      getSiswaKelas(km.kelasId),
    ]);
    const komponenIds = new Set(komponen.map((k) => k.id));
    const siswaIds = new Set(siswa.map((s) => s.id));

    const errors: { index: number; pesan: string }[] = [];
    const bersih = new Map<
      string,
      {
        penggunaId: string;
        komponenNilaiId: string;
        nilai: number;
        catatan?: string;
      }
    >();

    nilai.forEach((item: any, index: number) => {
      const penggunaId = item?.penggunaId;
      const komponenNilaiId = item?.komponenNilaiId;
      const angka = parseAngka(item?.nilai);

      if (typeof penggunaId !== "string" || !siswaIds.has(penggunaId)) {
        errors.push({
          index,
          pesan: "Siswa tidak terdaftar di kelas mapel ini",
        });
        return;
      }
      if (
        typeof komponenNilaiId !== "string" ||
        !komponenIds.has(komponenNilaiId)
      ) {
        errors.push({
          index,
          pesan: "Komponen tidak ditemukan di kelas mapel ini",
        });
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
        message:
          "Terdapat data nilai yang tidak valid, tidak ada yang disimpan",
        data: errors,
      });
    }

    const existing = await prisma.nilai.findMany({
      where: {
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
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
      where: {
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
      orderBy: { dibuatPada: "asc" },
    });

    if (komponen.length === 0)
      throw new AppError("Belum ada komponen nilai", 400);

    const aggregate = await getAggregateSubject(sekolahId, km.kelas.tahunAjaranId, km.mataPelajaran.id);
    const weights = aggregateWeights(komponen, aggregate);
    const totalBobot = round2(komponen.reduce((acc, k) => acc + weights.get(k.id)!, 0));
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
      where: {
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
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
    const kkm = aggregate?.kkm ?? resolveKkm(config, km.mataPelajaran.nama);
    const sekarang = new Date();

    await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${sekolahId}:nilai:${km.kelas.tahunAjaranId}`}))`;
      const latest = await getAggregateSubject(sekolahId, km.kelas.tahunAjaranId, km.mataPelajaran.id, tx);
      if (JSON.stringify(latest) !== JSON.stringify(aggregate)) throw new AppError("Agregat berubah selama finalisasi; muat ulang dan coba lagi", 409);
      if (await tx.nilaiAkhirMapel.count({ where: { kelasMapelId, status: "final", dihapusOleh: null } })) throw new AppError("Nilai sudah difinalisasi", 409);
      await Promise.all(siswa.map((s) => {
      const detail = komponen.map((k) => ({
        komponenId: k.id,
        nama: k.nama,
        nilai: nilaiMap.get(`${s.id}:${k.id}`) as number,
        bobot: weights.get(k.id)!,
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

      return tx.nilaiAkhirMapel.upsert({
        where: {
          kelasMapelId_penggunaId: { kelasMapelId, penggunaId: s.id },
        },
        update: { ...data, diperbaruiOleh: userId },
        create: { ...data, kelasMapelId, penggunaId: s.id, dibuatOleh: userId },
      });
      }));
    });

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

export const tarikSumberNilai = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, sekolahId } = getAuth(req);
    const { kelasMapelId, komponenNilaiId, jenisSumber, sumberId } = req.body;

    const km = await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    if (await isFinalized(kelasMapelId)) {
      throw new AppError(
        "Nilai sudah difinalisasi dan tidak dapat diubah",
        400,
      );
    }

    const komponen = await prisma.komponenNilai.findFirst({
      where: {
        id: komponenNilaiId,
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
      select: { id: true },
    });

    if (!komponen) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const siswa = await getSiswaKelas(km.kelas.id);
    const anggotaIds = new Set(siswa.map((s) => s.id));

    const nilaiPerSiswa = new Map<string, { nilai: number; waktu: number }>();

    if (jenisSumber === "asesmen") {
      const asesmen = await prisma.asesmen.findFirst({
        where: {
          id: sumberId,
          kelasMapelId,
          dihapusOleh: null,
          kelasMapel: { kelas: { sekolahId } },
        },
        select: { id: true },
      });

      if (!asesmen) {
        throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
      }

      const hasil = await prisma.hasilAsesmen.findMany({
        where: {
          dihapusOleh: null,
          percobaanAsesmen: {
            asesmenId: sumberId,
            asesmen: { kelasMapel: { kelas: { sekolahId } } },
            dihapusOleh: null,
          },
        },
        select: {
          totalNilai: true,
          percobaanAsesmen: {
            select: {
              siswaId: true,
              selesaiPada: true,
              dibuatPada: true,
            },
          },
        },
      });

      for (const item of hasil) {
        const siswaId = item.percobaanAsesmen.siswaId;

        if (!anggotaIds.has(siswaId)) continue;

        const angka = Number(item.totalNilai);
        if (!Number.isFinite(angka) || angka < 0 || angka > 100) {
          continue;
        }

        const waktu =
          item.percobaanAsesmen.selesaiPada?.getTime() ??
          item.percobaanAsesmen.dibuatPada.getTime();

        const existing = nilaiPerSiswa.get(siswaId);

        if (
          !existing ||
          angka > existing.nilai ||
          (angka === existing.nilai && waktu > existing.waktu)
        ) {
          nilaiPerSiswa.set(siswaId, {
            nilai: angka,
            waktu,
          });
        }
      }
    } else {
      const tugas = await prisma.tugas.findFirst({
        where: {
          id: sumberId,
          kelasMapelId,
          dihapusOleh: null,
          kelasMapel: { kelas: { sekolahId } },
        },
        select: { id: true },
      });

      if (!tugas) {
        throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
      }

      const pengumpulan = await prisma.pengumpulanTugas.findMany({
        where: {
          tugasId: sumberId,
          tugas: { kelasMapel: { kelas: { sekolahId } } },
          dihapusOleh: null,
        },
        select: {
          penggunaId: true,
          nilai: true,
          diperbaruiPada: true,
        },
        orderBy: {
          diperbaruiPada: "desc",
        },
      });

      for (const item of pengumpulan) {
        const siswaId = item.penggunaId;

        if (!anggotaIds.has(siswaId) || item.nilai === null) {
          continue;
        }

        const angka = Number(item.nilai);
        if (!Number.isFinite(angka) || angka < 0 || angka > 100) {
          continue;
        }

        if (!nilaiPerSiswa.has(siswaId)) {
          nilaiPerSiswa.set(siswaId, {
            nilai: angka,
            waktu: item.diperbaruiPada.getTime(),
          });
        }
      }
    }

    const dataNilai = Array.from(nilaiPerSiswa.entries());

    if (dataNilai.length === 0) {
      return successResponse(
        res,
        "Tidak ada nilai sumber yang valid untuk disinkronkan",
        {
          jumlahDisimpan: 0,
          jumlahDilewati: siswa.length,
        },
      );
    }

    await prisma.$transaction(async (tx) => {
      const finalisasi = await tx.nilaiAkhirMapel.count({
        where: {
          kelasMapelId,
          status: "final",
          dihapusOleh: null,
        },
      });

      if (finalisasi > 0) {
        throw new AppError(
          "Nilai sudah difinalisasi dan tidak dapat diubah",
          400,
        );
      }

      for (const [penggunaId, data] of dataNilai) {
        await tx.nilai.upsert({
          where: {
            penggunaId_komponenNilaiId: {
              penggunaId,
              komponenNilaiId,
            },
          },
          update: {
            kelasMapelId,
            nilai: data.nilai,
            sumber: "otomatis",
            sumberId,
            diperbaruiOleh: userId,
            dihapusOleh: null,
          },
          create: {
            penggunaId,
            kelasMapelId,
            komponenNilaiId,
            nilai: data.nilai,
            sumber: "otomatis",
            sumberId,
            dibuatOleh: userId,
          },
        });
      }
    });

    return successResponse(res, "Nilai sumber berhasil disinkronkan", {
      jenisSumber,
      sumberId,
      jumlahDisimpan: dataNilai.length,
      jumlahDilewati: Math.max(0, siswa.length - dataNilai.length),
    });
  } catch (error) {
    next(error);
  }
};

export const importNilaiExcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const filePath = req.file?.path;

  try {
    const { userId, sekolahId } = getAuth(req);
    const { kelasMapelId, komponenNilaiId } = req.body;

    if (!filePath) {
      throw new AppError("File Excel .xlsx wajib diunggah", 400);
    }

    const km = await loadKelasMapelGuru(kelasMapelId, userId, sekolahId);

    if (await isFinalized(kelasMapelId)) {
      throw new AppError(
        "Nilai sudah difinalisasi dan tidak dapat diubah",
        400,
      );
    }

    const komponen = await prisma.komponenNilai.findFirst({
      where: {
        id: komponenNilaiId,
        kelasMapelId,
        dihapusOleh: null,
        kelasMapel: { kelas: { sekolahId } },
      },
      select: { id: true },
    });

    if (!komponen) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const workbook = new ExcelJS.Workbook();

    try {
      await workbook.xlsx.readFile(filePath);
    } catch {
      throw new AppError(
        "File Excel rusak atau formatnya tidak valid",
        400,
        "INVALID_EXCEL",
      );
    }

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount < 1) {
      throw new AppError("Worksheet Excel kosong", 400);
    }

    if (worksheet.rowCount > 5001) {
      throw new AppError("Maksimal 5000 baris data per file Excel", 400);
    }

    const headerRow = worksheet.getRow(1);
    const headers = new Map<string, number>();

    headerRow.eachCell((cell, colNumber) => {
      const header = String(cell.text ?? "")
        .trim()
        .toLowerCase();

      if (header) headers.set(header, colNumber);
    });

    const nisnCol = headers.get("nisn");
    const nisCol = headers.get("nis");
    const nilaiCol = headers.get("nilai");

    if ((!nisnCol && !nisCol) || !nilaiCol) {
      throw new AppError("Header wajib: NISN atau NIS, serta Nilai", 400);
    }

    const siswa = await getSiswaKelas(km.kelas.id);

    const identifierMap = new Map<string, Set<string>>();

    const addIdentifier = (
      identifier: string | null | undefined,
      siswaId: string,
    ) => {
      const key = identifier?.trim().toLowerCase();
      if (!key) return;

      if (!identifierMap.has(key)) {
        identifierMap.set(key, new Set<string>());
      }

      identifierMap.get(key)!.add(siswaId);
    };

    for (const s of siswa) {
      addIdentifier(s.nisn, s.id);
      addIdentifier(s.nis, s.id);
    }

    const errors: { baris: number; pesan: string }[] = [];
    const nilaiValid = new Map<string, { penggunaId: string; nilai: number }>();
    const siswaDuplikat = new Set<string>();

    const readSimpleCell = (cell: ExcelJS.Cell): string => {
      const value = cell.value;

      if (typeof value === "string" || typeof value === "number") {
        return String(value).trim();
      }

      return "";
    };

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);

      const nisn = nisnCol ? readSimpleCell(row.getCell(nisnCol)) : "";
      const nis = nisCol ? readSimpleCell(row.getCell(nisCol)) : "";
      const nilaiRaw = readSimpleCell(row.getCell(nilaiCol));

      if (!nisn && !nis && !nilaiRaw) continue;

      if (!nisn && !nis) {
        errors.push({
          baris: rowNumber,
          pesan: "NISN atau NIS wajib diisi",
        });
        continue;
      }

      const candidateIds = new Set<string>();

      for (const identifier of [nisn, nis]) {
        if (!identifier) continue;

        const matches = identifierMap.get(identifier.toLowerCase());
        matches?.forEach((id) => candidateIds.add(id));
      }

      if (candidateIds.size === 0) {
        errors.push({
          baris: rowNumber,
          pesan: "Siswa tidak ditemukan atau bukan anggota kelas ini",
        });
        continue;
      }

      if (candidateIds.size > 1) {
        errors.push({
          baris: rowNumber,
          pesan: "Identitas siswa ambigu",
        });
        continue;
      }

      const penggunaId = Array.from(candidateIds)[0];
      if (!penggunaId) continue;

      if (nilaiValid.has(penggunaId) || siswaDuplikat.has(penggunaId)) {
        siswaDuplikat.add(penggunaId);
        nilaiValid.delete(penggunaId);

        errors.push({
          baris: rowNumber,
          pesan: "Siswa muncul lebih dari sekali dalam file",
        });
        continue;
      }

      const angka = parseAngka(nilaiRaw);

      if (angka === null || angka < 0 || angka > 100) {
        errors.push({
          baris: rowNumber,
          pesan: "Nilai harus berupa angka 0–100",
        });
        continue;
      }

      nilaiValid.set(penggunaId, {
        penggunaId,
        nilai: angka,
      });
    }

    const dataValid = Array.from(nilaiValid.values());

    if (dataValid.length > 0) {
      await prisma.$transaction(async (tx) => {
        const finalisasi = await tx.nilaiAkhirMapel.count({
          where: {
            kelasMapelId,
            status: "final",
            dihapusOleh: null,
          },
        });

        if (finalisasi > 0) {
          throw new AppError(
            "Nilai sudah difinalisasi dan tidak dapat diubah",
            400,
          );
        }

        for (const item of dataValid) {
          await tx.nilai.upsert({
            where: {
              penggunaId_komponenNilaiId: {
                penggunaId: item.penggunaId,
                komponenNilaiId,
              },
            },
            update: {
              kelasMapelId,
              nilai: item.nilai,
              sumber: "excel",
              sumberId: null,
              catatan: "Diimpor dari Excel",
              diperbaruiOleh: userId,
              dihapusOleh: null,
            },
            create: {
              penggunaId: item.penggunaId,
              kelasMapelId,
              komponenNilaiId,
              nilai: item.nilai,
              sumber: "excel",
              catatan: "Diimpor dari Excel",
              dibuatOleh: userId,
            },
          });
        }
      });
    }

    return successResponse(res, "Proses import nilai selesai", {
      jumlahBarisValid: dataValid.length,
      jumlahBerhasil: dataValid.length,
      jumlahDilewati: errors.length,
      detailDilewati: errors,
    });
  } catch (error) {
    next(error);
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Gagal menghapus file Excel sementara:", error);
      }
    }
  }
};
