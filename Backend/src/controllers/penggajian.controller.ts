import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";
import {
  kalkulasiPenggajianSchema,
  updateStatusPenggajianSchema,
} from "../validations/penggajian.validation";
import { normalizeRole } from "../utils/rbac";
import { z } from "zod";

const STATUS_HADIR = ["hadir", "Hadir", "HADIR", "h", "H", "terlambat", "Terlambat", "TERLAMBAT"];
const UKURAN_BATCH = 5;

const getTenantSekolahId = (req: AuthRequest, targetSekolahId?: string): string => {
  const actorRole = normalizeRole(req.user?.role);
  if (actorRole === "super_admin") {
    const sId = targetSekolahId || req.user?.sekolahId;
    if (!sId) {
      throw new AppError("Superadmin wajib menyertakan sekolahId", 400);
    }
    return sId;
  }
  if (!req.user?.sekolahId) {
    throw new AppError("Akses ditolak: Anda tidak terhubung dengan sekolah manapun", 403);
  }
  return req.user.sekolahId;
};

export const kalkulasiPenggajian = async (req: AuthRequest, res: Response) => {
  const data = kalkulasiPenggajianSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, data.sekolahId);
  const operatorId = req.user?.userId;

  const { bulan, tahun, penggunaId } = data;

  const tanggalMulai = new Date(Date.UTC(tahun, bulan - 1, 1, 0, 0, 0, 0));
  const tanggalSelesai = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59, 999));

  const userWhere: any = {
    sekolahId,
    dihapusPada: null,
    peran: {
      nama: {
        notIn: ["siswa", "Siswa", "SISWA"],
      },
    },
  };

  if (penggunaId) {
    userWhere.id = penggunaId;
  }

  const pegawaiList = await prisma.pengguna.findMany({
    where: userWhere,
    include: {
      kategoriJabatan: {
        include: {
          tarifRiwayat: {
            orderBy: { berlakuMulai: "desc" },
          },
        },
      },
      peran: true,
    },
  });

  if (pegawaiList.length === 0) {
    throw new AppError("Tidak ada data pegawai yang memenuhi kriteria kalkulasi", 404);
  }

  const pegawaiIds = pegawaiList.map((p) => p.id);

  const [gajiLamaList, absensiAll] = await Promise.all([
    prisma.penggajian.findMany({
      where: {
        sekolahId,
        bulan,
        tahun,
        penggunaId: { in: pegawaiIds },
      },
      select: { penggunaId: true, status: true },
    }),
    prisma.absensi.findMany({
      where: {
        sekolahId,
        penggunaId: { in: pegawaiIds },
        tanggal: {
          gte: tanggalMulai,
          lte: tanggalSelesai,
        },
        status: { in: STATUS_HADIR },
        shiftKerjaId: { not: null },
        waktuKeluar: { not: null },
        durasiJamKerja: { not: null },
      },
      select: {
        penggunaId: true,
        durasiJamKerja: true,
      },
    }),
  ]);

  const statusLamaMap = new Map<string, string>();
  for (const g of gajiLamaList) {
    statusLamaMap.set(g.penggunaId, g.status);
  }

  const absensiMap = new Map<string, { hari: number; jam: number }>();
  for (const a of absensiAll) {
    const cur = absensiMap.get(a.penggunaId) ?? { hari: 0, jam: 0 };
    cur.hari += 1;
    cur.jam += Number(a.durasiJamKerja || 0);
    absensiMap.set(a.penggunaId, cur);
  }

  const dilewati: any[] = [];
  const antrian: { pegawai: (typeof pegawaiList)[number]; args: any }[] = [];

  for (const pegawai of pegawaiList) {
    const statusLama = statusLamaMap.get(pegawai.id);

    if (statusLama === "dibekukan" || statusLama === "disetujui" || statusLama === "dibayar") {
      dilewati.push({
        nama: pegawai.namaLengkap,
        alasan: `Data penggajian sudah berstatus '${statusLama}' (terkunci).`,
      });
      continue;
    }

    let tarifPerJam = 0;
    const riwayat = pegawai.kategoriJabatan?.tarifRiwayat ?? [];
    if (riwayat.length > 0) {
      const tarifCocok = riwayat.find((t) => {
        const tMulai = new Date(t.berlakuMulai);
        const tAkhir = t.berakhirPada ? new Date(t.berakhirPada) : null;
        return tMulai <= tanggalSelesai && (!tAkhir || tAkhir >= tanggalMulai);
      });
      const dipakai = tarifCocok ?? riwayat[0];
      if (dipakai) {
        tarifPerJam = Number(dipakai.tarifPerJam);
      }
    }

    const rekap = absensiMap.get(pegawai.id) ?? { hari: 0, jam: 0 };
    const totalHariKerja = rekap.hari;
    const totalJamKerja = parseFloat(rekap.jam.toFixed(2));
    const totalGaji = Math.round(totalJamKerja * tarifPerJam);

    antrian.push({
      pegawai,
      args: {
        where: {
          sekolahId_penggunaId_bulan_tahun: {
            sekolahId,
            penggunaId: pegawai.id,
            bulan,
            tahun,
          },
        },
        create: {
          sekolahId,
          penggunaId: pegawai.id,
          bulan,
          tahun,
          tanggalMulai,
          tanggalSelesai,
          totalHariKerja,
          totalJamKerja,
          tarifPerJam,
          totalGaji,
          status: "draft",
          dibuatOleh: operatorId,
        },
        update: {
          tanggalMulai,
          tanggalSelesai,
          totalHariKerja,
          totalJamKerja,
          tarifPerJam,
          totalGaji,
          diperbaruiOleh: operatorId,
        },
      },
    });
  }

  const hasilKalkulasi: any[] = [];

  for (let i = 0; i < antrian.length; i += UKURAN_BATCH) {
    const potongan = antrian.slice(i, i + UKURAN_BATCH);
    const hasilPotongan = await Promise.all(
      potongan.map(async ({ pegawai, args }) => {
        const record = await prisma.penggajian.upsert(args);
        return {
          ...record,
          pengguna: {
            id: pegawai.id,
            namaLengkap: pegawai.namaLengkap,
            email: pegawai.email,
            jabatan: pegawai.jabatan,
          },
        };
      }),
    );
    hasilKalkulasi.push(...hasilPotongan);
  }

  return successResponse(
    res,
    `Kalkulasi penggajian periode ${bulan}/${tahun} selesai`,
    {
      totalDiproses: hasilKalkulasi.length,
      totalDilewati: dilewati.length,
      hasil: hasilKalkulasi,
      dilewati,
    },
    200,
  );
};

export const getPenggajian = async (req: AuthRequest, res: Response) => {
  const targetSekolahId = req.query.sekolahId as string | undefined;
  const sekolahId = getTenantSekolahId(req, targetSekolahId);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const bulan = req.query.bulan ? parseInt(req.query.bulan as string) : undefined;
  const tahun = req.query.tahun ? parseInt(req.query.tahun as string) : undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const skip = (page - 1) * limit;

  const where: any = {
    sekolahId,
  };

  if (bulan) where.bulan = bulan;
  if (tahun) where.tahun = tahun;
  if (status) where.status = status;

  if (search) {
    where.pengguna = {
      namaLengkap: { contains: search, mode: "insensitive" },
    };
  }

  const [total, data, aggregate] = await Promise.all([
    prisma.penggajian.count({ where }),
    prisma.penggajian.findMany({
      where,
      skip,
      take: limit,
      include: {
        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            nip: true,
            kategoriJabatan: {
              select: { nama: true },
            },
            shiftKerjaMaster: {
              select: { nama: true, jamMasuk: true, jamKeluar: true },
            },
          },
        },
      },
      orderBy: [{ tahun: "desc" }, { bulan: "desc" }, { dibuatPada: "desc" }],
    }),
    prisma.penggajian.aggregate({
      where,
      _sum: {
        totalGaji: true,
        totalJamKerja: true,
      },
    }),
  ]);

  const summary = {
    totalAnggaranGaji: aggregate._sum.totalGaji || 0,
    totalJamKerja: aggregate._sum.totalJamKerja || 0,
  };

  return res.status(200).json({
    success: true,
    message: "Data rekapitulasi penggajian berhasil diambil",
    data,
    summary,
    meta: {
      page,
      limit,
      total,
      totalData: total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getPenggajianById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);

  const gaji = await prisma.penggajian.findFirst({
    where: { id, sekolahId },
    include: {
      pengguna: {
        select: {
          id: true,
          namaLengkap: true,
          email: true,
          nip: true,
          kategoriJabatan: {
            select: { nama: true, kode: true },
          },
          shiftKerjaMaster: true,
        },
      },
    },
  });

  if (!gaji) {
    throw new AppError("Data penggajian tidak ditemukan", 404);
  }

  const rincianAbsensi = await prisma.absensi.findMany({
    where: {
      sekolahId,
      penggunaId: gaji.penggunaId,
      tanggal: {
        gte: gaji.tanggalMulai,
        lte: gaji.tanggalSelesai,
      },
      status: { in: STATUS_HADIR },
      shiftKerjaId: { not: null },
      waktuKeluar: { not: null },
      durasiJamKerja: { not: null },
    },
    select: {
      id: true,
      tanggal: true,
      waktuMasuk: true,
      waktuKeluar: true,
      durasiKerjaMenit: true,
      durasiJamKerja: true,
      statusShift: true,
      terlambatMenit: true,
    },
    orderBy: { tanggal: "asc" },
  });

  return successResponse(res, "Detail penggajian berhasil diambil", {
    ...gaji,
    rincianAbsensi,
  });
};

export const freezePenggajian = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);
  const userId = req.user?.userId;

  const gaji = await prisma.penggajian.findFirst({
    where: { id, sekolahId },
  });

  if (!gaji) {
    throw new AppError("Data penggajian tidak ditemukan", 404);
  }

  if (gaji.status === "dibekukan" || gaji.status === "disetujui") {
    throw new AppError(`Data penggajian sudah berstatus '${gaji.status}' sebelumnya`, 400);
  }

  const updated = await prisma.penggajian.update({
    where: { id },
    data: {
      status: "dibekukan",
      dibekukanPada: new Date(),
      dibekukanOleh: userId,
      diperbaruiOleh: userId,
    },
  });

  return successResponse(res, "Data penggajian berhasil dibekukan (freeze/approve)", updated);
};

const freezePeriodeSchema = z.object({
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2000).max(2100),
  sekolahId: z.string().uuid().optional(),
});

export const freezePeriodePenggajian = async (req: AuthRequest, res: Response) => {
  const data = freezePeriodeSchema.parse(req.body);
  const sekolahId = getTenantSekolahId(req, data.sekolahId);
  const userId = req.user?.userId;

  const result = await prisma.penggajian.updateMany({
    where: {
      sekolahId,
      bulan: data.bulan,
      tahun: data.tahun,
      status: "draft",
    },
    data: {
      status: "dibekukan",
      dibekukanPada: new Date(),
      dibekukanOleh: userId,
      diperbaruiOleh: userId,
    },
  });

  return successResponse(
    res,
    `Sebanyak ${result.count} data penggajian periode ${data.bulan}/${data.tahun} berhasil dibekukan secara permanen.`,
    { totalDibekukan: result.count },
  );
};

export const updateStatusPenggajian = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = getTenantSekolahId(req);
  const data = updateStatusPenggajianSchema.parse(req.body);
  const userId = req.user?.userId;

  const gaji = await prisma.penggajian.findFirst({
    where: { id, sekolahId },
  });

  if (!gaji) {
    throw new AppError("Data penggajian tidak ditemukan", 404);
  }

  const updatePayload: any = {
    status: data.status,
    diperbaruiOleh: userId,
  };

  if (data.catatan !== undefined) {
    updatePayload.catatan = data.catatan;
  }

  if (data.status === "dibekukan" || data.status === "disetujui") {
    if (!gaji.dibekukanPada) {
      updatePayload.dibekukanPada = new Date();
      updatePayload.dibekukanOleh = userId;
    }
  }

  const updated = await prisma.penggajian.update({
    where: { id },
    data: updatePayload,
  });

  return successResponse(res, `Status penggajian berhasil diubah menjadi ${data.status}`, updated);
};

export const getSlipGajiSaya = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const bulan = req.query.bulan ? parseInt(req.query.bulan as string) : undefined;
  const tahun = req.query.tahun ? parseInt(req.query.tahun as string) : undefined;

  const where: any = {
    penggunaId: userId,
    status: { in: ["dibekukan", "disetujui", "dibayar"] },
  };

  if (bulan) where.bulan = bulan;
  if (tahun) where.tahun = tahun;

  const data = await prisma.penggajian.findMany({
    where,
    include: {
      sekolah: {
        select: {
          nama: true,
          alamat: true,
          telepon: true,
          logoBesarUrl: true,
        },
      },
      pengguna: {
        select: {
          namaLengkap: true,
          nip: true,
          kategoriJabatan: {
            select: { nama: true },
          },
        },
      },
    },
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
  });

  return successResponse(res, "Data slip gaji berhasil diambil", data);
};