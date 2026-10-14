import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from "../config/db";
import {
  handle,
  getUser,
  ok,
  parsePage,
  str,
  requireStr,
  toMoney,
  toDate,
  optDate,
  nomor,
  HttpError,
} from '../utils/keuangan.helper';

const TIPE_AKUN = ['kas', 'bank'];
const KATEGORI_SISTEM = ['pembayaran_tagihan', 'tabungan_setor', 'tabungan_tarik'];
const ZERO = new Prisma.Decimal(0);

type Db = Prisma.TransactionClient | typeof prisma;

const hitungSaldoAkun = async (db: Db, sekolahId: string, akunIds: string[]) => {
  const groups = await db.jurnalKas.groupBy({
    by: ['akunKasId', 'jenis'],
    where: { sekolahId, akunKasId: { in: akunIds }, status: 'aktif', dihapusPada: null },
    _sum: { jumlah: true },
  });
  const map = new Map<string, { masuk: Prisma.Decimal; keluar: Prisma.Decimal }>();
  for (const id of akunIds) map.set(id, { masuk: ZERO, keluar: ZERO });
  for (const g of groups) {
    const cur = map.get(g.akunKasId)!;
    if (g.jenis === 'masuk') cur.masuk = g._sum.jumlah ?? ZERO;
    else cur.keluar = g._sum.jumlah ?? ZERO;
  }
  return map;
};

export const listAkun = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const status = str(req.query.status);

  const akun = await prisma.akunKas.findMany({
    where: { sekolahId, dihapusPada: null, ...(status ? { status } : {}) },
    orderBy: { kode: 'asc' },
  });

  const saldoMap = await hitungSaldoAkun(prisma, sekolahId, akun.map((a) => a.id));

  const data = akun.map((a) => {
    const s = saldoMap.get(a.id)!;
    return {
      ...a,
      totalMasuk: s.masuk,
      totalKeluar: s.keluar,
      saldo: a.saldoAwal.plus(s.masuk).minus(s.keluar),
    };
  });

  const totalSaldo = data.reduce((acc, a) => acc.plus(a.saldo), ZERO);
  return res.json({ success: true, message: 'Berhasil', data, ringkasan: { totalSaldo } });
});

export const createAkun = handle(async (req: Request, res: Response) => {
  const { id, sekolahId } = getUser(req);
  const kode = requireStr(req.body.kode, 'Kode').toUpperCase();
  const nama = requireStr(req.body.nama, 'Nama');
  const tipe = str(req.body.tipe) ?? 'kas';
  if (!TIPE_AKUN.includes(tipe)) throw new HttpError(400, 'Tipe akun harus kas atau bank');
  const saldoAwal =
    req.body.saldoAwal === undefined || req.body.saldoAwal === ''
      ? ZERO
      : toMoney(req.body.saldoAwal, 'Saldo awal', true);

  const dup = await prisma.akunKas.findFirst({ where: { sekolahId, kode, dihapusPada: null } });
  if (dup) throw new HttpError(409, 'Kode akun kas sudah digunakan');

  const data = await prisma.akunKas.create({
    data: { sekolahId, kode, nama, tipe, saldoAwal, status: 'aktif', dibuatOleh: id },
  });

  return ok(res, data, 'Akun kas dibuat', 201);
});

export const updateAkun = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.akunKas.findFirst({ where: { id, sekolahId, dihapusPada: null } });
  if (!current) throw new HttpError(404, 'Akun kas tidak ditemukan');

  const data: Prisma.AkunKasUpdateInput = { diperbaruiOleh: userId };

  if (req.body.nama !== undefined) data.nama = requireStr(req.body.nama, 'Nama');
  if (req.body.tipe !== undefined) {
    const tipe = requireStr(req.body.tipe, 'Tipe');
    if (!TIPE_AKUN.includes(tipe)) throw new HttpError(400, 'Tipe akun harus kas atau bank');
    data.tipe = tipe;
  }
  if (req.body.status !== undefined) {
    const status = requireStr(req.body.status, 'Status');
    if (!['aktif', 'tidak_aktif'].includes(status)) throw new HttpError(400, 'Status tidak valid');
    data.status = status;
  }
  if (req.body.saldoAwal !== undefined) {
    const pakai = await prisma.jurnalKas.count({ where: { akunKasId: id, dihapusPada: null } });
    if (pakai > 0) {
      throw new HttpError(409, 'Saldo awal tidak dapat diubah karena akun sudah memiliki transaksi');
    }
    data.saldoAwal = toMoney(req.body.saldoAwal, 'Saldo awal', true);
  }

  const updated = await prisma.akunKas.update({ where: { id }, data });
  return ok(res, updated, 'Akun kas diperbarui');
});

export const deleteAkun = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);

  const current = await prisma.akunKas.findFirst({ where: { id, sekolahId, dihapusPada: null } });
  if (!current) throw new HttpError(404, 'Akun kas tidak ditemukan');

  const [jurnal, bayar, tabungan] = await Promise.all([
    prisma.jurnalKas.count({ where: { akunKasId: id } }),
    prisma.pembayaranTagihan.count({ where: { akunKasId: id } }),
    prisma.transaksiTabungan.count({ where: { akunKasId: id } }),
  ]);
  if (jurnal + bayar + tabungan > 0) {
    throw new HttpError(409, 'Akun kas sudah memiliki transaksi dan tidak dapat dihapus, nonaktifkan saja');
  }

  await prisma.akunKas.update({
    where: { id },
    data: { dihapusPada: new Date(), dihapusOleh: userId, status: 'tidak_aktif' },
  });

  return ok(res, null, 'Akun kas dihapus');
});

export const listJurnal = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);

  const where: Prisma.JurnalKasWhereInput = { sekolahId, dihapusPada: null };
  const akunKasId = str(req.query.akunKasId);
  const jenis = str(req.query.jenis);
  const kategori = str(req.query.kategori);
  const sumber = str(req.query.sumber);
  const status = str(req.query.status);
  const dari = optDate(req.query.dari, 'Tanggal dari');
  const sampai = optDate(req.query.sampai, 'Tanggal sampai');
  const q = str(req.query.q);

  if (akunKasId) where.akunKasId = akunKasId;
  if (jenis) where.jenis = jenis;
  if (kategori) where.kategori = kategori;
  if (sumber) where.sumber = sumber;
  if (status) where.status = status;
  if (dari || sampai) {
    where.tanggal = { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) };
  }
  if (q) {
    where.OR = [
      { nomorJurnal: { contains: q, mode: 'insensitive' } },
      { keterangan: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [data, total, perJenis] = await Promise.all([
    prisma.jurnalKas.findMany({
      where,
      include: { akunKas: { select: { id: true, kode: true, nama: true } } },
      orderBy: [{ tanggal: 'desc' }, { dibuatPada: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.jurnalKas.count({ where }),
    prisma.jurnalKas.groupBy({
      by: ['jenis'],
      where: { ...where, status: 'aktif' },
      _sum: { jumlah: true },
    }),
  ]);

  const masuk = perJenis.find((p) => p.jenis === 'masuk')?._sum.jumlah ?? ZERO;
  const keluar = perJenis.find((p) => p.jenis === 'keluar')?._sum.jumlah ?? ZERO;

  return res.json({
    success: true,
    message: 'Berhasil',
    data,
    ringkasan: { totalMasuk: masuk, totalKeluar: keluar, selisih: masuk.minus(keluar) },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

export const createJurnal = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const akunKasId = requireStr(req.body.akunKasId, 'Akun kas');
  const jenis = requireStr(req.body.jenis, 'Jenis');
  const kategori = requireStr(req.body.kategori, 'Kategori').toLowerCase().replace(/\s+/g, '_');
  const jumlah = toMoney(req.body.jumlah, 'Jumlah');
  const tanggal = toDate(req.body.tanggal, 'Tanggal');
  const keterangan = str(req.body.keterangan);

  if (!['masuk', 'keluar'].includes(jenis)) throw new HttpError(400, 'Jenis harus masuk atau keluar');
  if (kategori.length > 50) throw new HttpError(400, 'Kategori maksimal 50 karakter');
  if (KATEGORI_SISTEM.includes(kategori)) {
    throw new HttpError(400, 'Kategori ini dicatat otomatis oleh sistem');
  }

  const data = await prisma.$transaction(async (tx) => {
    const akun = await tx.akunKas.findFirst({
      where: { id: akunKasId, sekolahId, status: 'aktif', dihapusPada: null },
    });
    if (!akun) throw new HttpError(404, 'Akun kas tidak ditemukan atau tidak aktif');

    if (jenis === 'keluar') {
      const s = (await hitungSaldoAkun(tx, sekolahId, [akunKasId])).get(akunKasId)!;
      const saldo = akun.saldoAwal.plus(s.masuk).minus(s.keluar);
      if (jumlah.gt(saldo)) throw new HttpError(400, 'Saldo akun kas tidak mencukupi');
    }

    return tx.jurnalKas.create({
      data: {
        sekolahId,
        akunKasId,
        nomorJurnal: nomor('JRN'),
        tanggal,
        jenis,
        kategori,
        jumlah,
        keterangan,
        sumber: 'manual',
        status: 'aktif',
        dibuatOleh: userId,
      },
    });
  });

  return ok(res, data, 'Jurnal kas dicatat', 201);
});

export const batalkanJurnal = handle(async (req: Request, res: Response) => {
  const { id: userId, sekolahId } = getUser(req);
  const id = String(req.params.id);
  const alasan = requireStr(req.body.alasan, 'Alasan pembatalan');

  const current = await prisma.jurnalKas.findFirst({ where: { id, sekolahId, dihapusPada: null } });
  if (!current) throw new HttpError(404, 'Jurnal tidak ditemukan');
  if (current.sumber !== 'manual') {
    throw new HttpError(409, 'Jurnal otomatis dibatalkan lewat transaksi asalnya');
  }

  const upd = await prisma.jurnalKas.updateMany({
    where: { id, sekolahId, status: 'aktif' },
    data: {
      status: 'dibatalkan',
      keterangan: `${current.keterangan ?? ''} | Dibatalkan: ${alasan}`.trim(),
      diperbaruiOleh: userId,
    },
  });
  if (upd.count === 0) throw new HttpError(409, 'Jurnal sudah dibatalkan');

  return ok(res, null, 'Jurnal dibatalkan');
});

export const laporanKas = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const dari = toDate(req.query.dari, 'Tanggal dari');
  const sampai = toDate(req.query.sampai, 'Tanggal sampai');
  const akunKasId = str(req.query.akunKasId);
  if (dari.getTime() > sampai.getTime()) throw new HttpError(400, 'Rentang tanggal tidak valid');

  const akunWhere: Prisma.AkunKasWhereInput = {
    sekolahId,
    dihapusPada: null,
    ...(akunKasId ? { id: akunKasId } : {}),
  };
  const akun = await prisma.akunKas.findMany({ where: akunWhere, select: { id: true, saldoAwal: true } });
  if (akunKasId && akun.length === 0) throw new HttpError(404, 'Akun kas tidak ditemukan');

  const akunIds = akun.map((a) => a.id);
  const base: Prisma.JurnalKasWhereInput = {
    sekolahId,
    akunKasId: { in: akunIds },
    status: 'aktif',
    dihapusPada: null,
  };

  const [sebelum, periode, perKategori] = await Promise.all([
    prisma.jurnalKas.groupBy({
      by: ['jenis'],
      where: { ...base, tanggal: { lt: dari } },
      _sum: { jumlah: true },
    }),
    prisma.jurnalKas.groupBy({
      by: ['jenis'],
      where: { ...base, tanggal: { gte: dari, lte: sampai } },
      _sum: { jumlah: true },
      _count: { _all: true },
    }),
    prisma.jurnalKas.groupBy({
      by: ['kategori', 'jenis'],
      where: { ...base, tanggal: { gte: dari, lte: sampai } },
      _sum: { jumlah: true },
      _count: { _all: true },
    }),
  ]);

  const sum = (rows: { jenis: string; _sum: { jumlah: Prisma.Decimal | null } }[], j: string) =>
    rows.find((r) => r.jenis === j)?._sum.jumlah ?? ZERO;

  const saldoAwalAkun = akun.reduce((acc, a) => acc.plus(a.saldoAwal), ZERO);
  const saldoAwalPeriode = saldoAwalAkun.plus(sum(sebelum, 'masuk')).minus(sum(sebelum, 'keluar'));
  const totalMasuk = sum(periode, 'masuk');
  const totalKeluar = sum(periode, 'keluar');

  return ok(res, {
    periode: { dari, sampai },
    saldoAwal: saldoAwalPeriode,
    totalMasuk,
    totalKeluar,
    saldoAkhir: saldoAwalPeriode.plus(totalMasuk).minus(totalKeluar),
    jumlahTransaksi: periode.reduce((n, p) => n + p._count._all, 0),
    perKategori: perKategori
      .map((k) => ({
        kategori: k.kategori,
        jenis: k.jenis,
        total: k._sum.jumlah ?? ZERO,
        jumlah: k._count._all,
      }))
      .sort((a, b) => b.total.comparedTo(a.total)),
  });
});

export const bukuKas = handle(async (req: Request, res: Response) => {
  const { sekolahId } = getUser(req);
  const { page, limit, skip } = parsePage(req);
  const akunKasId = requireStr(req.query.akunKasId, 'Akun kas');
  const dari = optDate(req.query.dari, 'Tanggal dari');
  const sampai = optDate(req.query.sampai, 'Tanggal sampai');

  const akun = await prisma.akunKas.findFirst({ where: { id: akunKasId, sekolahId, dihapusPada: null } });
  if (!akun) throw new HttpError(404, 'Akun kas tidak ditemukan');

  const base: Prisma.JurnalKasWhereInput = {
    sekolahId,
    akunKasId,
    status: 'aktif',
    dihapusPada: null,
  };

  let saldoAwal = akun.saldoAwal;
  if (dari) {
    const sebelum = await prisma.jurnalKas.groupBy({
      by: ['jenis'],
      where: { ...base, tanggal: { lt: dari } },
      _sum: { jumlah: true },
    });
    for (const s of sebelum) {
      saldoAwal = s.jenis === 'masuk' ? saldoAwal.plus(s._sum.jumlah ?? ZERO) : saldoAwal.minus(s._sum.jumlah ?? ZERO);
    }
  }

  const where: Prisma.JurnalKasWhereInput = {
    ...base,
    ...(dari || sampai
      ? { tanggal: { ...(dari ? { gte: dari } : {}), ...(sampai ? { lte: sampai } : {}) } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.jurnalKas.findMany({ where, orderBy: [{ tanggal: 'asc' }, { dibuatPada: 'asc' }] }),
    prisma.jurnalKas.count({ where }),
  ]);

  let berjalan = saldoAwal;
  const lengkap = rows.map((r) => {
    berjalan = r.jenis === 'masuk' ? berjalan.plus(r.jumlah) : berjalan.minus(r.jumlah);
    return {
      id: r.id,
      nomorJurnal: r.nomorJurnal,
      tanggal: r.tanggal,
      kategori: r.kategori,
      keterangan: r.keterangan,
      debit: r.jenis === 'masuk' ? r.jumlah : ZERO,
      kredit: r.jenis === 'keluar' ? r.jumlah : ZERO,
      saldo: berjalan,
    };
  });

  return res.json({
    success: true,
    message: 'Berhasil',
    data: lengkap.slice(skip, skip + limit),
    ringkasan: { saldoAwal, saldoAkhir: berjalan },
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});