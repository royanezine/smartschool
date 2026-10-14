import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from "../config/db";
import {
  handle,
  getUser,
  ok,
  okPage,
  parsePage,
  str,
  requireStr,
  toDate,
  nomor,
  todayDate,
  HttpError,
  STATUS_TAGIHAN_AKTIF,
} from '../utils/keuangan.helper';

const MS_HARI = 86400000;

const siswaSelect = { id: true, namaLengkap: true, nis: true, nisn: true } as const;

const kelasFilter = (kelasId: string) => ({
  kelasSiswa: { some: { kelasId, dihapusPada: null } },
});

export const generateTagihan = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const kategoriTagihanId = requireStr(req.body.kategoriTagihanId, 'Kategori tagihan');
  const tahunAjaranId = requireStr(req.body.tahunAjaranId, 'Tahun ajaran');
  const jatuhTempo = toDate(req.body.jatuhTempo, 'Jatuh tempo');
  const kelasId = str(req.body.kelasId);

  const [kategori, tahun] = await Promise.all([
    prisma.kategoriTagihan.findFirst({
      where: { id: kategoriTagihanId, sekolahId, dihapusPada: null, status: 'aktif' },
    }),
    prisma.tahunAjaran.findFirst({ where: { id: tahunAjaranId, sekolahId, dihapusPada: null } }),
  ]);
  if (!kategori) throw new HttpError(404, 'Kategori tagihan tidak ditemukan atau tidak aktif');
  if (!tahun) throw new HttpError(404, 'Tahun ajaran tidak ditemukan');

  let periodeBulan: number | null = null;
  let periodeTahun: number | null = null;
  if (kategori.siklus === 'bulanan') {
    periodeBulan = parseInt(String(req.body.periodeBulan), 10);
    periodeTahun = parseInt(String(req.body.periodeTahun), 10);
    if (!Number.isInteger(periodeBulan) || periodeBulan < 1 || periodeBulan > 12) {
      throw new HttpError(400, 'Periode bulan harus 1 sampai 12');
    }
    if (!Number.isInteger(periodeTahun) || periodeTahun < 2000 || periodeTahun > 2100) {
      throw new HttpError(400, 'Periode tahun tidak valid');
    }
  } else if (req.body.periodeTahun !== undefined && str(req.body.periodeTahun)) {
    periodeTahun = parseInt(String(req.body.periodeTahun), 10);
    if (!Number.isInteger(periodeTahun)) throw new HttpError(400, 'Periode tahun tidak valid');
  }

  if (kelasId) {
    const kelas = await prisma.kelas.findFirst({
      where: { id: kelasId, sekolahId, tahunAjaranId, dihapusPada: null },
    });
    if (!kelas) throw new HttpError(404, 'Kelas tidak ditemukan pada tahun ajaran ini');
  }

  const tarifList = await prisma.tarifTagihan.findMany({
    where: { sekolahId, kategoriTagihanId, tahunAjaranId, status: 'aktif', dihapusPada: null },
  });
  if (tarifList.length === 0) {
    throw new HttpError(400, 'Belum ada tarif aktif untuk kategori dan tahun ajaran ini');
  }

  const anggota = await prisma.anggotaKelas.findMany({
    where: {
      tahunAjaranId,
      dihapusPada: null,
      kelas: { sekolahId, dihapusPada: null, ...(kelasId ? { id: kelasId } : {}) },
      siswa: { dihapusPada: null, sekolahId },
    },
    select: { penggunaId: true, kelasId: true, kelas: { select: { tingkat: true } } },
  });

  const siswaMap = new Map<string, { kelasId: string; tingkat: string }>();
  for (const a of anggota) {
    if (!siswaMap.has(a.penggunaId)) {
      siswaMap.set(a.penggunaId, { kelasId: a.kelasId, tingkat: a.kelas.tingkat });
    }
  }

  const siswaIds = [...siswaMap.keys()];
  if (siswaIds.length === 0) throw new HttpError(400, 'Tidak ada siswa pada cakupan yang dipilih');

  const existing = await prisma.tagihan.findMany({
    where: {
      sekolahId,
      kategoriTagihanId,
      tahunAjaranId,
      periodeBulan,
      periodeTahun,
      status: { not: 'batal' },
      dihapusPada: null,
      siswaId: { in: siswaIds },
    },
    select: { siswaId: true },
  });
  const sudahAda = new Set(existing.map((e) => e.siswaId));

  let tanpaTarif = 0;
  const rows: Prisma.TagihanCreateManyInput[] = [];

  for (const [siswaId, info] of siswaMap) {
    if (sudahAda.has(siswaId)) continue;

    const tarif =
      tarifList.find((t) => t.kelasId === info.kelasId) ??
      tarifList.find((t) => !t.kelasId && t.tingkat === info.tingkat) ??
      tarifList.find((t) => !t.kelasId && !t.tingkat);

    if (!tarif) {
      tanpaTarif += 1;
      continue;
    }

    rows.push({
      sekolahId,
      siswaId,
      kategoriTagihanId,
      tarifTagihanId: tarif.id,
      tahunAjaranId,
      nomorTagihan: nomor('TGH'),
      periodeBulan,
      periodeTahun,
      nominal: tarif.nominal,
      diskon: new Prisma.Decimal(0),
      totalTagihan: tarif.nominal,
      totalDibayar: new Prisma.Decimal(0),
      sisa: tarif.nominal,
      jatuhTempo,
      status: 'belum_bayar',
      keterangan: str(req.body.keterangan),
      dibuatOleh: userId,
    });
  }

  if (rows.length > 0) {
    await prisma.tagihan.createMany({ data: rows });
  }

  return ok(
    res,
    {
      totalSiswa: siswaIds.length,
      dibuat: rows.length,
      dilewatiSudahAda: sudahAda.size,
      dilewatiTanpaTarif: tanpaTarif,
    },
    `${rows.length} tagihan berhasil dibuat`,
    201
  );
});

export const listTagihan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);

  const where: Prisma.TagihanWhereInput = { sekolahId, dihapusPada: null };
  const siswaId = str(req.query.siswaId);
  const kelasId = str(req.query.kelasId);
  const status = str(req.query.status);
  const kategoriTagihanId = str(req.query.kategoriTagihanId);
  const tahunAjaranId = str(req.query.tahunAjaranId);
  const periodeBulan = str(req.query.periodeBulan);
  const periodeTahun = str(req.query.periodeTahun);
  const q = str(req.query.q);

  if (siswaId) where.siswaId = siswaId;
  if (status) where.status = status;
  if (kategoriTagihanId) where.kategoriTagihanId = kategoriTagihanId;
  if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;
  if (periodeBulan) where.periodeBulan = parseInt(periodeBulan, 10);
  if (periodeTahun) where.periodeTahun = parseInt(periodeTahun, 10);

  const siswaWhere: Prisma.PenggunaWhereInput = {};
  if (kelasId) Object.assign(siswaWhere, kelasFilter(kelasId));
  if (q) {
    where.OR = [
      { nomorTagihan: { contains: q, mode: 'insensitive' } },
      { siswa: { namaLengkap: { contains: q, mode: 'insensitive' } } },
      { siswa: { nis: { contains: q, mode: 'insensitive' } } },
    ];
  }
  if (Object.keys(siswaWhere).length > 0) where.siswa = siswaWhere;

  const [data, total] = await Promise.all([
    prisma.tagihan.findMany({
      where,
      include: {
        siswa: { select: siswaSelect },
        kategoriTagihan: { select: { id: true, kode: true, nama: true } },
      },
      orderBy: [{ jatuhTempo: 'asc' }, { dibuatPada: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.tagihan.count({ where }),
  ]);

  return okPage(res, data, page, limit, total);
});

export const detailTagihan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const id = String(req.params.id);

  const data = await prisma.tagihan.findFirst({
    where: { id, sekolahId, dihapusPada: null },
    include: {
      siswa: { select: siswaSelect },
      kategoriTagihan: { select: { id: true, kode: true, nama: true, siklus: true } },
      tahunAjaran: { select: { id: true, tahunAjaran: true, semester: true } },
      pembayaran: { where: { dihapusPada: null }, orderBy: { tanggalBayar: 'desc' } },
    },
  });
  if (!data) throw new HttpError(404, 'Tagihan tidak ditemukan');

  return ok(res, data);
});

export const batalkanTagihan = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);
  const alasan = requireStr(req.body.alasan, 'Alasan pembatalan');

  const result = await prisma.tagihan.updateMany({
    where: {
      id,
      sekolahId,
      dihapusPada: null,
      status: 'belum_bayar',
      totalDibayar: new Prisma.Decimal(0),
    },
    data: { status: 'batal', sisa: new Prisma.Decimal(0), keterangan: alasan, diperbaruiOleh: userId },
  });

  if (result.count === 0) {
    const exists = await prisma.tagihan.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!exists) throw new HttpError(404, 'Tagihan tidak ditemukan');
    throw new HttpError(409, 'Tagihan yang sudah memiliki pembayaran atau sudah dibatalkan tidak dapat dibatalkan');
  }

  return ok(res, null, 'Tagihan dibatalkan');
});

const whereTunggakan = (req: Request, sekolahId: string): Prisma.TagihanWhereInput => {
  const where: Prisma.TagihanWhereInput = {
    sekolahId,
    dihapusPada: null,
    status: { in: STATUS_TAGIHAN_AKTIF },
    jatuhTempo: { lt: todayDate() },
  };
  const siswaId = str(req.query.siswaId);
  const kelasId = str(req.query.kelasId);
  const kategoriTagihanId = str(req.query.kategoriTagihanId);
  const tahunAjaranId = str(req.query.tahunAjaranId);
  if (siswaId) where.siswaId = siswaId;
  if (kategoriTagihanId) where.kategoriTagihanId = kategoriTagihanId;
  if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;
  if (kelasId) where.siswa = kelasFilter(kelasId);
  return where;
};

export const listTunggakan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);
  const where = whereTunggakan(req, sekolahId);
  const today = todayDate().getTime();

  const [rows, total, agg] = await Promise.all([
    prisma.tagihan.findMany({
      where,
      include: {
        siswa: { select: siswaSelect },
        kategoriTagihan: { select: { id: true, kode: true, nama: true } },
      },
      orderBy: { jatuhTempo: 'asc' },
      skip,
      take: limit,
    }),
    prisma.tagihan.count({ where }),
    prisma.tagihan.aggregate({ where, _sum: { sisa: true } }),
  ]);

  const data = rows.map((r) => ({
    ...r,
    hariTerlambat: Math.max(0, Math.floor((today - r.jatuhTempo.getTime()) / MS_HARI)),
  }));

  return res.json({
    success: true,
    message: 'Berhasil',
    data,
    ringkasan: { totalTunggakan: agg._sum.sisa ?? new Prisma.Decimal(0), jumlahTagihan: total },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const rekapTunggakanSiswa = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);
  const where = whereTunggakan(req, sekolahId);

  const groups = await prisma.tagihan.groupBy({
    by: ['siswaId'],
    where,
    _sum: { sisa: true },
    _count: { _all: true },
    _min: { jatuhTempo: true },
  });

  groups.sort((a, b) => {
    const x = a._sum.sisa ?? new Prisma.Decimal(0);
    const y = b._sum.sisa ?? new Prisma.Decimal(0);
    return y.comparedTo(x);
  });

  const total = groups.length;
  const slice = groups.slice(skip, skip + limit);
  const ids = slice.map((g) => g.siswaId);

  const [siswaList, anggota] = await Promise.all([
    prisma.pengguna.findMany({ where: { id: { in: ids } }, select: siswaSelect }),
    prisma.anggotaKelas.findMany({
      where: { penggunaId: { in: ids }, dihapusPada: null },
      orderBy: { dibuatPada: 'desc' },
      select: { penggunaId: true, kelas: { select: { id: true, nama: true, tingkat: true } } },
    }),
  ]);

  const siswaMap = new Map(siswaList.map((s) => [s.id, s]));
  const kelasMap = new Map<string, { id: string; nama: string; tingkat: string }>();
  for (const a of anggota) if (!kelasMap.has(a.penggunaId)) kelasMap.set(a.penggunaId, a.kelas);

  const today = todayDate().getTime();
  const data = slice.map((g) => ({
    siswa: siswaMap.get(g.siswaId) ?? null,
    kelas: kelasMap.get(g.siswaId) ?? null,
    jumlahTagihan: g._count._all,
    totalTunggakan: g._sum.sisa ?? new Prisma.Decimal(0),
    jatuhTempoTertua: g._min.jatuhTempo,
    hariTerlambatTerlama: g._min.jatuhTempo
      ? Math.max(0, Math.floor((today - g._min.jatuhTempo.getTime()) / MS_HARI))
      : 0,
  }));

  const grandTotal = groups.reduce(
    (acc, g) => acc.plus(g._sum.sisa ?? new Prisma.Decimal(0)),
    new Prisma.Decimal(0)
  );

  return res.json({
    success: true,
    message: 'Berhasil',
    data,
    ringkasan: { totalSiswaMenunggak: total, totalTunggakan: grandTotal },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const ringkasanTagihan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const tahunAjaranId = str(req.query.tahunAjaranId);

  const base: Prisma.TagihanWhereInput = {
    sekolahId,
    dihapusPada: null,
    status: { not: 'batal' },
    ...(tahunAjaranId ? { tahunAjaranId } : {}),
  };

  const [semua, tunggakan, perStatus] = await Promise.all([
    prisma.tagihan.aggregate({
      where: base,
      _sum: { totalTagihan: true, totalDibayar: true, sisa: true },
      _count: { _all: true },
    }),
    prisma.tagihan.aggregate({
      where: { ...base, status: { in: STATUS_TAGIHAN_AKTIF }, jatuhTempo: { lt: todayDate() } },
      _sum: { sisa: true },
      _count: { _all: true },
    }),
    prisma.tagihan.groupBy({ by: ['status'], where: base, _count: { _all: true } }),
  ]);

  const zero = new Prisma.Decimal(0);
  return ok(res, {
    jumlahTagihan: semua._count._all,
    totalTagihan: semua._sum.totalTagihan ?? zero,
    totalDibayar: semua._sum.totalDibayar ?? zero,
    totalSisa: semua._sum.sisa ?? zero,
    jumlahTunggakan: tunggakan._count._all,
    totalTunggakan: tunggakan._sum.sisa ?? zero,
    perStatus: perStatus.map((s) => ({ status: s.status, jumlah: s._count._all })),
  });
});