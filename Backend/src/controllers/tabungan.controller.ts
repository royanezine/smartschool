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
  toMoney,
  toDate,
  optDate,
  nomor,
  todayDate,
  HttpError,
} from '../utils/keuangan.helper';

const siswaSelect = { id: true, namaLengkap: true, nis: true, nisn: true } as const;

const filterPeranSiswa: Prisma.PenggunaWhereInput = {
  peran: { is: { nama: { equals: 'siswa', mode: 'insensitive' } } },
};

const BATAS_NOMINAL = new Prisma.Decimal('9999999999999');

type Jenis = 'setor' | 'tarik';

const tentukanAkunKas = async (
  tx: Prisma.TransactionClient,
  sekolahId: string,
  akunKasId?: string
) => {
  if (akunKasId) {
    const akunDipilih = await tx.akunKas.findFirst({
      where: { id: akunKasId, sekolahId, status: 'aktif', dihapusPada: null },
    });
    if (!akunDipilih) throw new HttpError(404, 'Akun kas tidak ditemukan atau tidak aktif');
    return akunDipilih;
  }

  const daftar = await tx.akunKas.findMany({
    where: { sekolahId, status: 'aktif', dihapusPada: null },
    orderBy: { dibuatPada: 'asc' },
    take: 20,
  });

  const [pertama] = daftar;
  if (!pertama) {
    throw new HttpError(400, 'Belum ada akun kas aktif. Buat akun kas terlebih dahulu');
  }
  if (daftar.length === 1) return pertama;

  const kas = daftar.filter((a) => a.tipe === 'kas');
  const [akunKasTunggal] = kas;
  if (kas.length === 1 && akunKasTunggal) return akunKasTunggal;

  throw new HttpError(400, 'Akun kas wajib dipilih karena terdapat lebih dari satu akun kas aktif');
};

const prosesTransaksi = async (req: Request, res: Response, jenis: Jenis) => {
  const { id: userId, sekolahId } = getUser(req);
  const siswaId = requireStr(req.body.siswaId, 'Siswa');
  const akunKasInput = str(req.body.akunKasId);
  const jumlah = toMoney(req.body.jumlah, 'Jumlah');
  if (jumlah.gt(BATAS_NOMINAL)) throw new HttpError(400, 'Jumlah melebihi batas yang diizinkan');
  const tanggal = req.body.tanggal ? toDate(req.body.tanggal, 'Tanggal') : todayDate();
  const keterangan = str(req.body.keterangan);

  const hasil = await prisma.$transaction(async (tx) => {
    const siswa = await tx.pengguna.findFirst({
      where: { id: siswaId, sekolahId, dihapusPada: null, ...filterPeranSiswa },
      select: siswaSelect,
    });
    if (!siswa) throw new HttpError(404, 'Siswa tidak ditemukan');

    const akun = await tentukanAkunKas(tx, sekolahId, akunKasInput);
    const akunKasId = akun.id;

    const tabungan = await tx.tabunganSiswa.upsert({
      where: { sekolahId_siswaId: { sekolahId, siswaId } },
      create: { sekolahId, siswaId, saldo: new Prisma.Decimal(0), status: 'aktif', dibuatOleh: userId },
      update: {},
    });
    if (tabungan.dihapusPada || tabungan.status !== 'aktif') {
      throw new HttpError(409, 'Rekening tabungan siswa tidak aktif');
    }

    let saldoSesudah: Prisma.Decimal;
    let saldoSebelum: Prisma.Decimal;

    if (jenis === 'setor') {
      const updated = await tx.tabunganSiswa.update({
        where: { id: tabungan.id },
        data: { saldo: { increment: jumlah }, diperbaruiOleh: userId },
      });
      saldoSesudah = updated.saldo;
      saldoSebelum = updated.saldo.minus(jumlah);
    } else {
      const upd = await tx.tabunganSiswa.updateMany({
        where: { id: tabungan.id, saldo: { gte: jumlah } },
        data: { saldo: { decrement: jumlah }, diperbaruiOleh: userId },
      });
      if (upd.count === 0) throw new HttpError(400, 'Saldo tabungan tidak mencukupi');
      const terbaru = await tx.tabunganSiswa.findUniqueOrThrow({ where: { id: tabungan.id } });
      saldoSesudah = terbaru.saldo;
      saldoSebelum = terbaru.saldo.plus(jumlah);
    }

    const transaksi = await tx.transaksiTabungan.create({
      data: {
        sekolahId,
        tabunganSiswaId: tabungan.id,
        akunKasId,
        petugasId: userId,
        nomorTransaksi: nomor(jenis === 'setor' ? 'TBS' : 'TBT'),
        jenis,
        jumlah,
        saldoSebelum,
        saldoSesudah,
        tanggal,
        keterangan,
        status: 'berhasil',
        dibuatOleh: userId,
      },
    });

    await tx.jurnalKas.create({
      data: {
        sekolahId,
        akunKasId,
        nomorJurnal: nomor('JRN'),
        tanggal,
        jenis: jenis === 'setor' ? 'masuk' : 'keluar',
        kategori: jenis === 'setor' ? 'tabungan_setor' : 'tabungan_tarik',
        jumlah,
        keterangan: `${jenis === 'setor' ? 'Setoran' : 'Penarikan'} tabungan ${siswa.namaLengkap}`,
        sumber: 'transaksi_tabungan',
        sumberId: transaksi.id,
        status: 'aktif',
        dibuatOleh: userId,
      },
    });

    return {
      siswa,
      transaksi,
      saldo: saldoSesudah,
      akunKas: { id: akun.id, kode: akun.kode, nama: akun.nama },
    };
  });

  return ok(
    res,
    hasil,
    jenis === 'setor' ? 'Setoran tabungan berhasil' : 'Penarikan tabungan berhasil',
    201
  );
};

export const setorTabungan = handle(async (req: Request, res: Response) =>
  prosesTransaksi(req, res, 'setor')
);

export const tarikTabungan = handle(async (req: Request, res: Response) =>
  prosesTransaksi(req, res, 'tarik')
);

export const cariSiswaTabungan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const q = requireStr(req.query.q, 'Kata kunci');
  if (q.length < 2) throw new HttpError(400, 'Kata kunci minimal 2 karakter');

  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit ?? '10'), 10) || 10));
  const kelasId = str(req.query.kelasId);

  const siswa = await prisma.pengguna.findMany({
    where: {
      sekolahId,
      dihapusPada: null,
      status: 'aktif',
      ...filterPeranSiswa,
      namaLengkap: { contains: q, mode: 'insensitive' },
      ...(kelasId ? { kelasSiswa: { some: { kelasId, dihapusPada: null } } } : {}),
    },
    select: {
      id: true,
      namaLengkap: true,
      kelasSiswa: {
        where: {
          dihapusPada: null,
          kelas: { sekolahId, dihapusPada: null, tahunAjaran: { status: 'aktif' } },
        },
        orderBy: { dibuatPada: 'desc' },
        take: 1,
        select: { kelas: { select: { id: true, nama: true, tingkat: true } } },
      },
    },
    orderBy: { namaLengkap: 'asc' },
    take: limit,
  });

  const data = siswa.map((s) => ({
    id: s.id,
    nama: s.namaLengkap,
    kelas: s.kelasSiswa[0]?.kelas ?? null,
  }));

  return ok(res, data);
});

export const listTabungan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);

  const where: Prisma.TabunganSiswaWhereInput = { sekolahId, dihapusPada: null };
  const kelasId = str(req.query.kelasId);
  const q = str(req.query.q);

  const siswaWhere: Prisma.PenggunaWhereInput = {};
  if (kelasId) siswaWhere.kelasSiswa = { some: { kelasId, dihapusPada: null } };
  if (q) {
    siswaWhere.OR = [
      { namaLengkap: { contains: q, mode: 'insensitive' } },
      { nis: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (Object.keys(siswaWhere).length > 0) where.siswa = siswaWhere;

  const [data, total, agg] = await Promise.all([
    prisma.tabunganSiswa.findMany({
      where,
      include: { siswa: { select: siswaSelect } },
      orderBy: { siswa: { namaLengkap: 'asc' } },
      skip,
      take: limit,
    }),
    prisma.tabunganSiswa.count({ where }),
    prisma.tabunganSiswa.aggregate({ where, _sum: { saldo: true } }),
  ]);

  return res.json({
    success: true,
    message: 'Berhasil',
    data,
    ringkasan: { totalSaldo: agg._sum.saldo ?? new Prisma.Decimal(0) },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const detailTabunganSiswa = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const siswaId = String(req.params.siswaId);

  const siswa = await prisma.pengguna.findFirst({
    where: { id: siswaId, sekolahId, dihapusPada: null },
    select: siswaSelect,
  });
  if (!siswa) throw new HttpError(404, 'Siswa tidak ditemukan');

  const tabungan = await prisma.tabunganSiswa.findFirst({
    where: { sekolahId, siswaId, dihapusPada: null },
  });

  return ok(res, {
    siswa,
    saldo: tabungan?.saldo ?? new Prisma.Decimal(0),
    status: tabungan?.status ?? 'belum_ada',
    tabunganId: tabungan?.id ?? null,
  });
});

export const mutasiTabungan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);
  const siswaId = String(req.params.siswaId);

  const tabungan = await prisma.tabunganSiswa.findFirst({
    where: { sekolahId, siswaId, dihapusPada: null },
  });
  if (!tabungan) throw new HttpError(404, 'Rekening tabungan siswa belum ada');

  const where: Prisma.TransaksiTabunganWhereInput = {
    sekolahId,
    tabunganSiswaId: tabungan.id,
    dihapusPada: null,
  };
  const jenis = str(req.query.jenis);
  const dari = optDate(req.query.dari, 'Tanggal dari');
  const sampai = optDate(req.query.sampai, 'Tanggal sampai');
  if (jenis) {
    if (!['setor', 'tarik'].includes(jenis)) throw new HttpError(400, 'Jenis tidak valid');
    where.jenis = jenis;
  }
  if (dari || sampai) {
    where.tanggal = { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) };
  }

  const [data, total] = await Promise.all([
    prisma.transaksiTabungan.findMany({
      where,
      include: { petugas: { select: { id: true, namaLengkap: true } } },
      orderBy: [{ tanggal: 'desc' }, { dibuatPada: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.transaksiTabungan.count({ where }),
  ]);

  return okPage(res, data, page, limit, total);
});

export const laporanTabungan = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const dari = optDate(req.query.dari, 'Tanggal dari');
  const sampai = optDate(req.query.sampai, 'Tanggal sampai');

  const where: Prisma.TransaksiTabunganWhereInput = {
    sekolahId,
    dihapusPada: null,
    status: 'berhasil',
    ...(dari || sampai
      ? { tanggal: { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) } }
      : {}),
  };

  const [perJenis, saldo] = await Promise.all([
    prisma.transaksiTabungan.groupBy({
      by: ['jenis'],
      where,
      _sum: { jumlah: true },
      _count: { _all: true },
    }),
    prisma.tabunganSiswa.aggregate({
      where: { sekolahId, dihapusPada: null },
      _sum: { saldo: true },
      _count: { _all: true },
    }),
  ]);

  const zero = new Prisma.Decimal(0);
  const setor = perJenis.find((p) => p.jenis === 'setor');
  const tarik = perJenis.find((p) => p.jenis === 'tarik');

  return ok(res, {
    totalSetoran: setor?._sum.jumlah ?? zero,
    jumlahSetoran: setor?._count._all ?? 0,
    totalPenarikan: tarik?._sum.jumlah ?? zero,
    jumlahPenarikan: tarik?._count._all ?? 0,
    totalSaldoSemuaSiswa: saldo._sum.saldo ?? zero,
    jumlahRekening: saldo._count._all,
  });
});