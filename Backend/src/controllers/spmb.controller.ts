import { Request, Response, NextFunction } from "express";
import { JalurPpdb } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { availableSchoolWhere } from "../utils/schoolAvailability";
import { todayDateOnly } from "../utils/dateOnly";
import { generatePpdbAccessToken } from "../utils/generateToken";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PendaftarRequest } from "../middlewares/ppdbAuth.middleware";
import { DEFAULT_JALUR, KategoriJalur } from "../utils/spmb.constants";
import {
  ambilPengaturanSpmb,
  ambilRankingJalur,
  keAngka,
  parseBerkasWajib,
} from "../services/spmb.service";

const BATAS_GAGAL = 5;
const DURASI_BLOKIR_MS = 15 * 60 * 1000;
const percobaanGagal = new Map<string, { jumlah: number; sampai: number }>();

const samarkanNama = (nama: string) =>
  nama
    .split(" ")
    .filter((kata) => kata.length > 0)
    .map((kata) => `${kata.charAt(0)}***`)
    .join(" ");

const sekolahIdDariAdmin = (req: Request): string => {
  const sekolahId = (req as AuthRequest).user?.sekolahId;

  if (!sekolahId) {
    throw new AppError("Sekolah tidak ditemukan", 400);
  }

  return sekolahId;
};

const penggunaIdDariAdmin = (req: Request): string | undefined =>
  (req as AuthRequest).user?.userId;

const ubahBerkasUnik = (daftar: unknown[]): string[] =>
  Array.from(
    new Set(daftar.filter((item): item is string => typeof item === "string")),
  );

const serialisasiJalur = (jalur: JalurPpdb) => ({
  id: jalur.id,
  sekolahId: jalur.sekolahId,
  nama: jalur.nama,
  deskripsi: jalur.deskripsi,
  kategori: jalur.kategori,
  kuota: jalur.kuota,
  metodeRanking: jalur.metodeRanking,
  jarakMaksimalKm: keAngka(jalur.jarakMaksimalKm),
  nilaiMinimal: keAngka(jalur.nilaiMinimal),
  berkasWajib: parseBerkasWajib(jalur.berkasWajib),
  tanggalMulai: jalur.tanggalMulai,
  tanggalSelesai: jalur.tanggalSelesai,
  status: jalur.status,
});

export const opsiPendaftaran = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = String(req.params.sekolahId);

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        id: sekolahId,
        ...availableSchoolWhere(),
      },
      select: {
        id: true,
        nama: true,
        jenjang: true,
        lintang: true,
        bujur: true,
      },
    });

    if (!sekolah) {
      throw new AppError("Sekolah tidak ditemukan", 404);
    }

    const [pengaturan, jalur, jurusan, gelombang, jumlah] = await Promise.all([
      ambilPengaturanSpmb(sekolahId),
      prisma.jalurPpdb.findMany({
        where: { sekolahId, status: "aktif", dihapusPada: null },
        orderBy: { dibuatPada: "asc" },
      }),
      prisma.jurusan.findMany({
        where: { sekolahId, status: "aktif", dihapusPada: null },
        orderBy: { nama: "asc" },
        select: { id: true, kode: true, nama: true, deskripsi: true },
      }),
      prisma.gelombangPpdb.findMany({
        where: { sekolahId, status: "aktif", dihapusPada: null },
        orderBy: { tanggalMulai: "asc" },
        select: {
          id: true,
          nama: true,
          jalurPpdbId: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          kuota: true,
        },
      }),
      prisma.pendaftaranPpdb.groupBy({
        by: ["jalurPpdbId"],
        where: {
          sekolahId,
          dihapusPada: null,
          status: { not: "ditolak" },
        },
        _count: { _all: true },
      }),
    ]);

    const terisi = new Map<string, number>(
      jumlah.map((item) => [item.jalurPpdbId, item._count._all]),
    );

    const sekarang = todayDateOnly();

    return res.status(200).json({
      success: true,
      data: {
        sekolah: {
          id: sekolah.id,
          nama: sekolah.nama,
          jenjang: sekolah.jenjang,
          koordinatTersedia: sekolah.lintang !== null && sekolah.bujur !== null,
        },
        wajibJurusan: (sekolah.jenjang || "").toUpperCase().trim() === "SMK",
        pendaftaranDibuka: pengaturan.pendaftaranDibuka,
        rankingTerbuka: pengaturan.rankingTerbuka,
        jurusan,
        gelombang,
        jalur: jalur.map((item) => ({
          ...serialisasiJalur(item),
          jumlahPendaftar: terisi.get(item.id) ?? 0,
          pendaftaranBuka:
            (!item.tanggalMulai || sekarang >= item.tanggalMulai) &&
            (!item.tanggalSelesai || sekarang <= item.tanggalSelesai),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginPendaftar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const nomorPendaftaran = String(req.body.nomorPendaftaran || "").trim();
    const nik = String(req.body.nik || "").trim();

    const sekarang = Date.now();
    const catatan = percobaanGagal.get(nomorPendaftaran);

    if (
      catatan &&
      catatan.jumlah >= BATAS_GAGAL &&
      catatan.sampai > sekarang
    ) {
      throw new AppError(
        "Terlalu banyak percobaan masuk, coba lagi beberapa menit lagi",
        429,
      );
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: { nomorPendaftaran, dihapusPada: null },
      select: {
        id: true,
        nomorPendaftaran: true,
        namaLengkap: true,
        nik: true,
        sekolahId: true,
        status: true,
      },
    });

    if (!pendaftaran || !pendaftaran.nik || pendaftaran.nik !== nik) {
      if (percobaanGagal.size > 5000) {
        percobaanGagal.clear();
      }

      const jumlahLama = catatan && catatan.sampai > sekarang ? catatan.jumlah : 0;

      percobaanGagal.set(nomorPendaftaran, {
        jumlah: jumlahLama + 1,
        sampai: sekarang + DURASI_BLOKIR_MS,
      });

      throw new AppError("Nomor pendaftaran atau NIK tidak sesuai", 401);
    }

    percobaanGagal.delete(nomorPendaftaran);

    const token = generatePpdbAccessToken(
      pendaftaran.id,
      pendaftaran.nomorPendaftaran,
      pendaftaran.sekolahId,
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil masuk",
      data: {
        token,
        pendaftar: {
          id: pendaftaran.id,
          nomorPendaftaran: pendaftaran.nomorPendaftaran,
          namaLengkap: pendaftaran.namaLengkap,
          status: pendaftaran.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const detailSaya = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pendaftarToken = (req as PendaftarRequest).pendaftar;

    if (!pendaftarToken) {
      throw new AppError("Sesi pendaftar tidak valid", 401);
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: { id: pendaftarToken.pendaftaranId, dihapusPada: null },
      include: {
        sekolah: { select: { id: true, nama: true, jenjang: true } },
        jalurPpdb: true,
        jurusan: { select: { id: true, kode: true, nama: true } },
        gelombangPpdb: {
          select: {
            id: true,
            nama: true,
            tanggalMulai: true,
            tanggalSelesai: true,
          },
        },
        berkasPpdb: {
          where: { dihapusPada: null },
          select: {
            id: true,
            namaBerkas: true,
            urlFile: true,
            status: true,
            keterangan: true,
            dibuatPada: true,
          },
        },
        hasilSeleksiPpdb: true,
      },
    });

    if (!pendaftaran) {
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    }

    const pengaturan = await ambilPengaturanSpmb(pendaftaran.sekolahId);
    const hasilRanking = await ambilRankingJalur(pendaftaran.jalurPpdbId);
    const entri = hasilRanking?.daftar.find((item) => item.id === pendaftaran.id);

    const berkasWajib = parseBerkasWajib(pendaftaran.jalurPpdb.berkasWajib);
    const terunggah = pendaftaran.berkasPpdb.map((item) => item.namaBerkas);

    return res.status(200).json({
      success: true,
      data: {
        pendaftar: {
          id: pendaftaran.id,
          nomorPendaftaran: pendaftaran.nomorPendaftaran,
          namaLengkap: pendaftaran.namaLengkap,
          nisn: pendaftaran.nisn,
          nik: pendaftaran.nik,
          tempatLahir: pendaftaran.tempatLahir,
          tanggalLahir: pendaftaran.tanggalLahir,
          jenisKelamin: pendaftaran.jenisKelamin,
          alamat: pendaftaran.alamat,
          telepon: pendaftaran.telepon,
          email: pendaftaran.email,
          namaAyah: pendaftaran.namaAyah,
          namaIbu: pendaftaran.namaIbu,
          asalSekolah: pendaftaran.asalSekolah,
          nilaiRapor: keAngka(pendaftaran.nilaiRapor),
          lintang: keAngka(pendaftaran.lintang),
          bujur: keAngka(pendaftaran.bujur),
          jarakKm: keAngka(pendaftaran.jarakKm),
          status: pendaftaran.status,
          dibuatPada: pendaftaran.dibuatPada,
        },
        sekolah: pendaftaran.sekolah,
        jalur: serialisasiJalur(pendaftaran.jalurPpdb),
        jurusan: pendaftaran.jurusan,
        gelombang: pendaftaran.gelombangPpdb,
        berkas: {
          wajib: berkasWajib,
          terunggah: pendaftaran.berkasPpdb,
          kurang: berkasWajib.filter((item) => !terunggah.includes(item)),
        },
        ranking:
          pengaturan.rankingTerbuka && entri && hasilRanking
            ? {
                peringkat: entri.peringkat,
                totalPendaftar: hasilRanking.totalPendaftar,
                kuota: hasilRanking.kuota,
                masukKuota: entri.masukKuota,
                memenuhiKriteria: entri.memenuhiKriteria,
                alasanTidakMemenuhi: entri.alasanTidakMemenuhi,
              }
            : null,
        hasilSeleksi: pendaftaran.hasilSeleksiPpdb,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rankingSaya = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pendaftarToken = (req as PendaftarRequest).pendaftar;

    if (!pendaftarToken) {
      throw new AppError("Sesi pendaftar tidak valid", 401);
    }

    const pengaturan = await ambilPengaturanSpmb(pendaftarToken.sekolahId);

    if (!pengaturan.rankingTerbuka) {
      throw new AppError("Peringkat belum dipublikasikan oleh sekolah", 403);
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: { id: pendaftarToken.pendaftaranId, dihapusPada: null },
      select: { jalurPpdbId: true },
    });

    if (!pendaftaran) {
      throw new AppError("Data pendaftaran tidak ditemukan", 404);
    }

    const hasil = await ambilRankingJalur(pendaftaran.jalurPpdbId);

    if (!hasil) {
      throw new AppError("Jalur pendaftaran tidak ditemukan", 404);
    }

    const batas = Math.min(
      Math.max(parseInt(String(req.query.limit ?? "100"), 10) || 100, 1),
      500,
    );

    const ubah = (item: (typeof hasil.daftar)[number]) => ({
      peringkat: item.peringkat,
      nomorPendaftaran: item.nomorPendaftaran,
      nama: samarkanNama(item.namaLengkap),
      jarakKm: item.jarakKm,
      nilaiRapor: item.nilaiRapor,
      status: item.status,
      memenuhiKriteria: item.memenuhiKriteria,
      masukKuota: item.masukKuota,
      saya: item.id === pendaftarToken.pendaftaranId,
    });

    const saya = hasil.daftar.find(
      (item) => item.id === pendaftarToken.pendaftaranId,
    );

    return res.status(200).json({
      success: true,
      data: {
        jalur: {
          id: hasil.jalurId,
          nama: hasil.namaJalur,
          kategori: hasil.kategori,
          metodeRanking: hasil.metodeRanking,
          kuota: hasil.kuota,
        },
        totalPendaftar: hasil.totalPendaftar,
        saya: saya ? ubah(saya) : null,
        daftar: hasil.daftar.slice(0, batas).map(ubah),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const ambilPengaturan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);

    const [pengaturan, sekolah] = await Promise.all([
      ambilPengaturanSpmb(sekolahId),
      prisma.sekolah.findUnique({
        where: { id: sekolahId },
        select: { jenjang: true, lintang: true, bujur: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...pengaturan,
        jenjang: sekolah?.jenjang ?? null,
        lintangSekolah: keAngka(sekolah?.lintang),
        bujurSekolah: keAngka(sekolah?.bujur),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const ubahPengaturan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);
    const penggunaId = penggunaIdDariAdmin(req);

    const {
      pendaftaranDibuka,
      wajibLokasi,
      batasiPendaftarSesuaiKuota,
      rankingTerbuka,
      kirimEmailKonfirmasi,
      lintangSekolah,
      bujurSekolah,
    } = req.body;

    if ((lintangSekolah === undefined) !== (bujurSekolah === undefined)) {
      throw new AppError(
        "Lintang dan bujur sekolah harus diisi bersamaan",
        400,
      );
    }

    const data = {
      ...(typeof pendaftaranDibuka === "boolean" ? { pendaftaranDibuka } : {}),
      ...(typeof wajibLokasi === "boolean" ? { wajibLokasi } : {}),
      ...(typeof batasiPendaftarSesuaiKuota === "boolean"
        ? { batasiPendaftarSesuaiKuota }
        : {}),
      ...(typeof rankingTerbuka === "boolean" ? { rankingTerbuka } : {}),
      ...(typeof kirimEmailKonfirmasi === "boolean"
        ? { kirimEmailKonfirmasi }
        : {}),
    };

    await prisma.$transaction(async (tx) => {
      await tx.pengaturanSpmb.upsert({
        where: { sekolahId },
        update: { ...data, diperbaruiOleh: penggunaId },
        create: {
          sekolahId,
          ...data,
          dibuatOleh: penggunaId,
          diperbaruiOleh: penggunaId,
        },
      });

      if (lintangSekolah !== undefined && bujurSekolah !== undefined) {
        await tx.sekolah.update({
          where: { id: sekolahId },
          data: {
            lintang: Number(lintangSekolah),
            bujur: Number(bujurSekolah),
          },
        });
      }
    });

    const [pengaturan, sekolah] = await Promise.all([
      ambilPengaturanSpmb(sekolahId),
      prisma.sekolah.findUnique({
        where: { id: sekolahId },
        select: { jenjang: true, lintang: true, bujur: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Pengaturan SPMB berhasil disimpan",
      data: {
        ...pengaturan,
        jenjang: sekolah?.jenjang ?? null,
        lintangSekolah: keAngka(sekolah?.lintang),
        bujurSekolah: keAngka(sekolah?.bujur),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const daftarJalurAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);

    const [jalur, jumlah] = await Promise.all([
      prisma.jalurPpdb.findMany({
        where: { sekolahId, dihapusPada: null },
        orderBy: { dibuatPada: "desc" },
      }),
      prisma.pendaftaranPpdb.groupBy({
        by: ["jalurPpdbId"],
        where: {
          sekolahId,
          dihapusPada: null,
          status: { not: "ditolak" },
        },
        _count: { _all: true },
      }),
    ]);

    const terisi = new Map<string, number>(
      jumlah.map((item) => [item.jalurPpdbId, item._count._all]),
    );

    return res.status(200).json({
      success: true,
      data: jalur.map((item) => ({
        ...serialisasiJalur(item),
        jumlahPendaftar: terisi.get(item.id) ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const buatJalur = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);
    const penggunaId = penggunaIdDariAdmin(req);

    const {
      nama,
      kategori,
      deskripsi,
      kuota,
      tanggalMulai,
      tanggalSelesai,
      jarakMaksimalKm,
      metodeRanking,
      nilaiMinimal,
      berkasWajib,
      status,
    } = req.body;

    const preset = DEFAULT_JALUR[kategori as KategoriJalur];

    if (!preset) {
      throw new AppError("Kategori jalur tidak valid", 400);
    }

    const mulai = tanggalMulai ? new Date(tanggalMulai) : undefined;
    const selesai = tanggalSelesai ? new Date(tanggalSelesai) : undefined;

    if (mulai && selesai && selesai < mulai) {
      throw new AppError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        400,
      );
    }

    const jalur = await prisma.jalurPpdb.create({
      data: {
        sekolahId,
        nama,
        deskripsi,
        kuota: Number(kuota),
        kategori,
        jarakMaksimalKm:
          jarakMaksimalKm !== undefined
            ? jarakMaksimalKm
            : preset.jarakMaksimalKm,
        metodeRanking: metodeRanking ?? preset.metodeRanking,
        nilaiMinimal:
          nilaiMinimal !== undefined ? nilaiMinimal : preset.nilaiMinimal,
        berkasWajib:
          Array.isArray(berkasWajib) && berkasWajib.length > 0
            ? ubahBerkasUnik(berkasWajib)
            : preset.berkasWajib,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        status: status ?? "aktif",
        dibuatOleh: penggunaId,
        diperbaruiOleh: penggunaId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Jalur SPMB berhasil dibuat",
      data: serialisasiJalur(jalur),
    });
  } catch (error) {
    next(error);
  }
};

export const ubahJalur = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);
    const penggunaId = penggunaIdDariAdmin(req);
    const id = String(req.params.id);

    const jalur = await prisma.jalurPpdb.findFirst({
      where: { id, sekolahId, dihapusPada: null },
    });

    if (!jalur) {
      throw new AppError("Jalur SPMB tidak ditemukan", 404);
    }

    const {
      nama,
      kategori,
      deskripsi,
      kuota,
      tanggalMulai,
      tanggalSelesai,
      jarakMaksimalKm,
      metodeRanking,
      nilaiMinimal,
      berkasWajib,
      status,
    } = req.body;

    const kategoriBerubah = kategori !== undefined && kategori !== jalur.kategori;
    const preset = kategoriBerubah
      ? DEFAULT_JALUR[kategori as KategoriJalur]
      : null;

    if (kategoriBerubah && !preset) {
      throw new AppError("Kategori jalur tidak valid", 400);
    }

    const nilaiBerkas =
      Array.isArray(berkasWajib) && berkasWajib.length > 0
        ? ubahBerkasUnik(berkasWajib)
        : preset
          ? preset.berkasWajib
          : undefined;

    const nilaiJarak =
      jarakMaksimalKm !== undefined
        ? jarakMaksimalKm
        : preset
          ? preset.jarakMaksimalKm
          : undefined;

    const nilaiMetode =
      metodeRanking !== undefined
        ? metodeRanking
        : preset
          ? preset.metodeRanking
          : undefined;

    const nilaiMin =
      nilaiMinimal !== undefined
        ? nilaiMinimal
        : preset
          ? preset.nilaiMinimal
          : undefined;

    const mulai =
      tanggalMulai === undefined
        ? undefined
        : tanggalMulai === null
          ? null
          : new Date(tanggalMulai);

    const selesai =
      tanggalSelesai === undefined
        ? undefined
        : tanggalSelesai === null
          ? null
          : new Date(tanggalSelesai);

    const mulaiEfektif = mulai === undefined ? jalur.tanggalMulai : mulai;
    const selesaiEfektif = selesai === undefined ? jalur.tanggalSelesai : selesai;

    if (mulaiEfektif && selesaiEfektif && selesaiEfektif < mulaiEfektif) {
      throw new AppError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai",
        400,
      );
    }

    const diperbarui = await prisma.jalurPpdb.update({
      where: { id: jalur.id },
      data: {
        nama,
        deskripsi,
        kuota: kuota !== undefined ? Number(kuota) : undefined,
        kategori,
        jarakMaksimalKm: nilaiJarak,
        metodeRanking: nilaiMetode,
        nilaiMinimal: nilaiMin,
        berkasWajib: nilaiBerkas,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        status,
        diperbaruiOleh: penggunaId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Jalur SPMB berhasil diperbarui",
      data: serialisasiJalur(diperbarui),
    });
  } catch (error) {
    next(error);
  }
};

export const rankingAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = sekolahIdDariAdmin(req);
    const hasil = await ambilRankingJalur(String(req.params.id), sekolahId);

    if (!hasil) {
      throw new AppError("Jalur SPMB tidak ditemukan", 404);
    }

    return res.status(200).json({
      success: true,
      data: hasil,
    });
  } catch (error) {
    next(error);
  }
};